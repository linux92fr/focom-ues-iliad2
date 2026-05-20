import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("SURVEY_FROM_EMAIL") ?? "FO COM UES ILIAD <contact@focomues-iliad.fr>";
const HASH_SECRET = Deno.env.get("SURVEY_EMAIL_HASH_SECRET") ?? SERVICE_ROLE_KEY;
const DEFAULT_DOMAIN = "iliad-free.fr";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDomain(email: string) {
  return email.split("@").pop()?.toLowerCase() ?? "";
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { survey_id, email } = await req.json();

    if (!survey_id || !email) return json({ error: "survey_id et email sont requis" }, 400);
    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY manquant" }, 500);

    const normalizedEmail = normalizeEmail(email);
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("id, title, is_active, starts_at, ends_at, participation_mode, allowed_email_domain")
      .eq("id", survey_id)
      .maybeSingle();

    if (surveyError) throw surveyError;
    if (!survey) return json({ error: "Sondage introuvable" }, 404);
    if (!survey.is_active) return json({ error: "Ce sondage n’est plus actif" }, 400);

    const now = new Date();
    if (survey.starts_at && new Date(survey.starts_at) > now) return json({ error: "Ce sondage n’est pas encore ouvert" }, 400);
    if (survey.ends_at && new Date(survey.ends_at) < now) return json({ error: "Ce sondage est clôturé" }, 400);

    if (survey.participation_mode === "adherents_only") {
      return json({ error: "Ce sondage est réservé aux adhérents actifs" }, 403);
    }

    const allowedDomain = (survey.allowed_email_domain || DEFAULT_DOMAIN).replace(/^@/, "").toLowerCase();
    if (getDomain(normalizedEmail) !== allowedDomain) {
      return json({ error: `Adresse professionnelle @${allowedDomain} requise` }, 400);
    }

    const emailHash = await sha256(`${normalizedEmail}:${HASH_SECRET}`);

    const { count: existingParticipantCount, error: existingParticipantError } = await supabase
      .from("survey_external_participants")
      .select("id", { count: "exact", head: true })
      .eq("survey_id", survey_id)
      .eq("email_hash", emailHash);

    if (existingParticipantError) throw existingParticipantError;
    if ((existingParticipantCount ?? 0) > 0) {
      return json({ error: "Une participation a déjà été enregistrée avec cette adresse professionnelle" }, 409);
    }

    const code = generateCode();
    const codeHash = await sha256(`${normalizedEmail}:${code}:${HASH_SECRET}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("survey_email_verifications")
      .insert({ survey_id, email_hash: emailHash, code_hash: codeHash, expires_at: expiresAt });

    if (insertError) throw insertError;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [normalizedEmail],
        subject: `Code de vérification sondage FO COM - ${survey.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
            <h2 style="color:#dc2626;margin:0 0 16px;">Code de vérification FO COM UES ILIAD</h2>
            <p>Bonjour,</p>
            <p>Voici votre code de sécurité pour participer au sondage :</p>
            <div style="font-size:28px;font-weight:bold;letter-spacing:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;margin:20px 0;">${code}</div>
            <p>Ce code est valable 10 minutes.</p>
            <p style="font-size:13px;color:#64748b;">Votre adresse email professionnelle est utilisée uniquement pour vérifier la pertinence du vote et vous envoyer ce code de sécurité. Elle n’est pas conservée en clair dans notre base de données.</p>
            <p style="font-size:13px;color:#64748b;">Solidairement,<br />L'équipe FO COM UES ILIAD</p>
          </div>
        `,
      }),
    });

    const resendBody = await resendResponse.text();
    if (!resendResponse.ok) {
      console.error("Resend error", resendResponse.status, resendBody);
      return json({ error: "Erreur lors de l’envoi du code" }, 502);
    }

    return json({ success: true, message: "Code envoyé" });
  } catch (error) {
    console.error("send-survey-code error", error);
    return json({ error: error instanceof Error ? error.message : "Erreur serveur" }, 500);
  }
});
