import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://formation.focomues-iliad.fr",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Méthode non autorisée" }, 405);

  try {
    const { requestId } = await req.json();
    if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
      return json({ success: false, error: "Référence de demande invalide" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!supabaseUrl || !serviceKey || !resendKey) {
      console.error("[notify-formation-request] Configuration serveur incomplète");
      return json({ success: false, error: "Service de notification indisponible" }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim().slice(0, 100);
    const now = new Date();
    const { data: limit } = await supabase.from("rate_limits").select("id,request_count,window_start")
      .eq("ip_address", ip).eq("endpoint", "notify-formation-request").maybeSingle();
    const windowExpired = !limit || (now.getTime() - new Date(limit.window_start).getTime()) > 60 * 60 * 1000;
    if (windowExpired) {
      const { error } = await supabase.from("rate_limits").upsert({
        ip_address: ip, endpoint: "notify-formation-request", request_count: 1,
        window_start: now.toISOString(), updated_at: now.toISOString(),
      }, { onConflict: "ip_address,endpoint" });
      if (error) console.error("[notify-formation-request] rate limit update failed", error.message);
    } else {
      if (limit.request_count >= 5) return json({ success: false, error: "Trop de notifications. Réessayez plus tard." }, 429);
      const { error } = await supabase.from("rate_limits").update({
        request_count: limit.request_count + 1, updated_at: now.toISOString(),
      }).eq("id", limit.id);
      if (error) console.error("[notify-formation-request] rate limit increment failed", error.message);
    }

    const { data: row, error: fetchError } = await supabase.from("formation_requests")
      .select("id,created_at,last_name,first_name,email,formation_title,session_start,session_end,company")
      .eq("id", requestId).maybeSingle();
    if (fetchError || !row) return json({ success: false, error: "Demande introuvable" }, 404);
    if (Date.now() - new Date(row.created_at).getTime() > 15 * 60 * 1000) {
      return json({ success: false, error: "Cette demande ne peut plus déclencher de notification" }, 400);
    }

    const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[ch]!);
    const dateFr = (value: string) => new Date(value + "T12:00:00").toLocaleDateString("fr-FR");
    const subject = "[FO COM UES ILIAD] Nouvelle demande de formation";
    const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><body style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.6">
      <div style="max-width:620px;margin:24px auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#dc2626;color:white;padding:22px"><h2 style="margin:0">Nouvelle préinscription formation</h2><p style="margin:6px 0 0">FO COM UES ILIAD · Portail Formation 2027</p></div>
      <div style="padding:24px"><p>Une nouvelle demande vient d'être enregistrée.</p>
      <p><b>Participant :</b> ${esc(row.first_name)} ${esc(row.last_name)}<br>
      <b>E-mail :</b> ${esc(row.email)}<br><b>Entreprise :</b> ${esc(row.company)}<br>
      <b>Formation :</b> ${esc(row.formation_title)}<br>
      <b>Session :</b> ${dateFr(row.session_start)} au ${dateFr(row.session_end)}</p>
      <p>Connectez-vous à l'espace gestionnaire pour consulter le dossier complet et assurer son suivi.</p>
      <p><a href="https://formation.focomues-iliad.fr/gestion" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Ouvrir le portail de gestion</a></p>
      <p style="font-size:12px;color:#64748b">Référence : ${esc(row.id)}</p></div></div></body></html>`;

    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "FO COM UES ILIAD <contact@focomues-iliad.fr>",
        to: ["formation@focomues-iliad.fr"],
        subject,
        html,
      }),
    });
    if (!mail.ok) {
      const detail = await mail.text();
      console.error("[notify-formation-request] Resend error", mail.status, detail.slice(0, 500));
      return json({ success: false, error: "La demande est enregistrée, mais la notification e-mail a échoué" }, 502);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[notify-formation-request] Unexpected error", error);
    return json({ success: false, error: "Erreur lors de la notification" }, 500);
  }
});
