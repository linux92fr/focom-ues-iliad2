const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

function wrapHtml(bodyHtml: string, unsubUrl: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td>
      <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:#dc2626;padding:24px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">FOCOM UES ILIAD</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;color:#475569;line-height:1.7;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#f1f5f9;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">
              Vous recevez cet email car vous êtes abonné à la newsletter FOCOM UES ILIAD.
            </p>
            <p style="margin:0;">
              <a href="${unsubUrl}" style="color:#dc2626;font-size:12px;">Se désabonner</a>
              &nbsp;·&nbsp;
              <a href="${siteUrl}" style="color:#94a3b8;font-size:12px;">${siteUrl.replace("https://", "")}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://focom-ues-iliad.fr";
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "newsletter@focom-ues-iliad.fr";

  if (!resendKey) return json({ error: "RESEND_API_KEY manquant" }, 500);

  // ── Auth admin ───────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Non autorisé" }, 401);

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: serviceKey },
  });
  if (!userRes.ok) return json({ error: "Token invalide" }, 401);
  const { id: userId } = await userRes.json();

  const roleRes = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=in.(admin,moderator)&select=role&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const roles = await roleRes.json();
  if (!Array.isArray(roles) || roles.length === 0) return json({ error: "Accès refusé" }, 403);

  // ── Paramètres ───────────────────────────────────────────────
  const { newsletterId } = await req.json();
  if (!newsletterId) return json({ error: "newsletterId requis" }, 400);

  // ── Lire la newsletter ───────────────────────────────────────────────
  const nlRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletters?id=eq.${newsletterId}&select=*&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const newsletters = await nlRes.json();
  if (!Array.isArray(newsletters) || !newsletters.length) {
    return json({ error: "Newsletter introuvable" }, 404);
  }
  const newsletter = newsletters[0];

  // ── Lire les abonnés actifs ──────────────────────────────────
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletter_subscribers?is_active=eq.true&select=email,unsubscribe_token`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const subscribers: Array<{ email: string; unsubscribe_token: string }> = await subsRes.json();

  if (!subscribers.length) {
    return json({ success: true, totalRecipients: 0, successfulSends: 0, failedSends: 0 });
  }

  // ── Enregistrer le début d'envoi ─────────────────────────────
  const sendRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_sends`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      newsletter_id: newsletterId,
      sent_by: userId,
      status: "sending",
      total_recipients: subscribers.length,
    }),
  });
  const sendRecords = await sendRes.json();
  const sendId: string | undefined = Array.isArray(sendRecords) ? sendRecords[0]?.id : undefined;

  // ── Envoi par batches de 100 (limite Resend) ─────────────────
  let successful = 0;
  let failed = 0;
  const BATCH = 100;

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    const emails = batch.map((sub) => ({
      from: `FOCOM UES ILIAD <${fromEmail}>`,
      to: [sub.email],
      subject: newsletter.subject,
      html: wrapHtml(
        newsletter.body_html,
        `${siteUrl}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`,
        siteUrl,
      ),
    }));

    const batchRes = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emails),
    });

    if (batchRes.ok) {
      successful += batch.length;
    } else {
      failed += batch.length;
      console.error("Batch send error:", await batchRes.text());
    }
  }

  // ── Mettre à jour le statut d'envoi ─────────────────────────
  if (sendId) {
    await fetch(`${supabaseUrl}/rest/v1/newsletter_sends?id=eq.${sendId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: failed === 0 ? "completed" : failed === subscribers.length ? "failed" : "partial",
        successful_sends: successful,
        failed_sends: failed,
      }),
    });
  }

  return json({
    success: true,
    totalRecipients: subscribers.length,
    successfulSends: successful,
    failedSends: failed,
  });
});
