import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const HASH_SECRET = Deno.env.get("SURVEY_EMAIL_HASH_SECRET") ?? SERVICE_ROLE_KEY;
const DEFAULT_DOMAIN = "iliad-free.fr";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
function getDomain(email: string) { return email.split("@").pop()?.toLowerCase() ?? ""; }
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

type AnswerPayload = {
  question_id: string;
  question_type: "single_choice" | "multiple_choice" | "text";
  option_id?: string;
  option_ids?: string[];
  text_response?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { survey_id, first_name, last_name, email, code, answers } = await req.json();
    if (!survey_id || !first_name || !last_name || !email || !code) return json({ error: "Nom, prénom, email professionnel et code sont requis" }, 400);
    if (!Array.isArray(answers) || answers.length === 0) return json({ error: "Aucune réponse à enregistrer" }, 400);

    const normalizedEmail = normalizeEmail(email);
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("id, is_active, starts_at, ends_at, allow_multiple_votes, participation_mode, allowed_email_domain")
      .eq("id", survey_id)
      .maybeSingle();

    if (surveyError) throw surveyError;
    if (!survey) return json({ error: "Sondage introuvable" }, 404);
    if (survey.participation_mode === "adherents_only") return json({ error: "Ce sondage est réservé aux adhérents actifs" }, 403);
    if (!survey.is_active) return json({ error: "Ce sondage n’est plus actif" }, 400);

    const now = new Date();
    if (survey.starts_at && new Date(survey.starts_at) > now) return json({ error: "Ce sondage n’est pas encore ouvert" }, 400);
    if (survey.ends_at && new Date(survey.ends_at) < now) return json({ error: "Ce sondage est clôturé" }, 400);

    const allowedDomain = (survey.allowed_email_domain || DEFAULT_DOMAIN).replace(/^@/, "").toLowerCase();
    if (getDomain(normalizedEmail) !== allowedDomain) return json({ error: `Adresse professionnelle @${allowedDomain} requise` }, 400);

    const emailHash = await sha256(`${normalizedEmail}:${HASH_SECRET}`);
    const codeHash = await sha256(`${normalizedEmail}:${String(code).trim()}:${HASH_SECRET}`);

    const { data: verification, error: verificationError } = await supabase
      .from("survey_email_verifications")
      .select("id, expires_at, used_at")
      .eq("survey_id", survey_id)
      .eq("email_hash", emailHash)
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError) throw verificationError;
    if (!verification) return json({ error: "Code invalide ou déjà utilisé" }, 400);
    if (new Date(verification.expires_at) < now) return json({ error: "Code expiré" }, 400);

    if (!survey.allow_multiple_votes) {
      const { count, error: participantCheckError } = await supabase
        .from("survey_external_participants")
        .select("id", { count: "exact", head: true })
        .eq("survey_id", survey_id)
        .eq("email_hash", emailHash);
      if (participantCheckError) throw participantCheckError;
      if ((count ?? 0) > 0) return json({ error: "Une participation a déjà été enregistrée avec cette adresse professionnelle" }, 409);
    }

    const { data: participant, error: participantError } = await supabase
      .from("survey_external_participants")
      .insert({ survey_id, first_name: String(first_name).trim(), last_name: String(last_name).trim(), email_hash: emailHash })
      .select("id")
      .single();
    if (participantError) throw participantError;

    const responseRows = [];
    for (const answer of answers as AnswerPayload[]) {
      if (!answer.question_id || !answer.question_type) continue;
      if (answer.question_type === "text") {
        if (!answer.text_response?.trim()) return json({ error: "Une réponse libre est vide" }, 400);
        responseRows.push({ survey_id, question_id: answer.question_id, text_response: answer.text_response.trim(), external_participant_id: participant.id, user_id: null });
      }
      if (answer.question_type === "single_choice") {
        if (!answer.option_id) return json({ error: "Une question à choix unique est sans réponse" }, 400);
        responseRows.push({ survey_id, question_id: answer.question_id, option_id: answer.option_id, external_participant_id: participant.id, user_id: null });
      }
      if (answer.question_type === "multiple_choice") {
        if (!answer.option_ids?.length) return json({ error: "Une question à choix multiples est sans réponse" }, 400);
        for (const optionId of answer.option_ids) responseRows.push({ survey_id, question_id: answer.question_id, option_id: optionId, external_participant_id: participant.id, user_id: null });
      }
    }

    if (responseRows.length === 0) return json({ error: "Aucune réponse valide" }, 400);
    const { error: responsesError } = await supabase.from("survey_responses").insert(responseRows);
    if (responsesError) throw responsesError;

    const { error: markUsedError } = await supabase.from("survey_email_verifications").update({ used_at: new Date().toISOString() }).eq("id", verification.id);
    if (markUsedError) throw markUsedError;

    return json({ success: true, participant_id: participant.id });
  } catch (error) {
    console.error("submit-external-survey-vote error", error);
    return json({ error: error instanceof Error ? error.message : "Erreur serveur" }, 500);
  }
});
