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

function markdownToHtml(text: string): string {
  return text
    .replace(/^### (.+)$/gm, "<h3 style=\"font-size:18px;font-weight:800;margin:20px 0 8px;color:#111827;\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 style=\"font-size:22px;font-weight:900;margin:24px 0 10px;color:#111827;\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 style=\"font-size:26px;font-weight:900;margin:24px 0 10px;color:#111827;\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---+$/gm, "<hr style=\"border:none;border-top:1px solid #e5e7eb;margin:20px 0;\"/>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\" style=\"color:#c62828;font-weight:700;\">$1</a>")
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<hr")) return trimmed;
      return `<p style="margin:0 0 16px;">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
}

function wrapHtml(bodyHtml: string, unsubUrl: string, siteUrl: string): string {
  const displayUrl = siteUrl.replace("https://", "").replace("http://", "");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FO COM UES ILIAD</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:28px 12px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="width:640px;max-width:100%;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 18px 45px rgba(15,23,42,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#8e0000 0%,#c62828 45%,#ff5f52 100%);padding:30px 34px 26px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;background:#ffffff;color:#c62828;font-weight:900;font-size:22px;line-height:1;border-radius:16px;padding:13px 16px;letter-spacing:-0.5px;">FO</div>
                    <div style="display:inline-block;vertical-align:middle;margin-left:12px;">
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">FO COM UES ILIAD</p>
                      <p style="margin:5px 0 0;color:rgba(255,255,255,0.86);font-size:13px;font-weight:600;">Informer · Défendre · Agir</p>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.28);">
                <p style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:900;letter-spacing:-0.7px;">Newsletter FO COM</p>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:14px;line-height:1.5;">L’essentiel de l’actualité sociale et syndicale du groupe ILIAD.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 34px 18px;background:#ffffff;">
              <div style="border-left:5px solid #c62828;background:#fff7f7;border-radius:0 16px 16px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#8e0000;font-size:13px;line-height:1.5;font-weight:700;">Message envoyé aux abonnés de la newsletter FO COM UES ILIAD.</p>
              </div>

              <div style="font-size:16px;line-height:1.75;color:#334155;">
                ${bodyHtml}
              </div>

              <div style="text-align:center;margin:30px 0 10px;">
                <a href="${siteUrl}" style="display:inline-block;background:#c62828;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;border-radius:999px;padding:13px 22px;box-shadow:0 8px 18px rgba(198,40,40,0.25);">Accéder au site FO COM</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 34px;background:#111827;color:#d1d5db;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size:12px;line-height:1.6;color:#d1d5db;">
                    <p style="margin:0 0 8px;font-weight:800;color:#ffffff;">FO COM UES ILIAD</p>
                    <p style="margin:0;color:#9ca3af;">Vous recevez cet email car vous êtes abonné à notre newsletter.</p>
                    <p style="margin:10px 0 0;">
                      <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;font-weight:700;">${displayUrl}</a>
                      <span style="color:#6b7280;"> · </span>
                      <a href="${unsubUrl}" style="color:#ffb4b4;text-decoration:underline;">Se désabonner</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function normalizeFromEmail(value: string) {
  if (value.includes("<") && value.includes(">")) return value;
  if (value.includes("@")) return `FO COM UES ILIAD <${value}>`;
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? Deno.env.get("SITE_URL") ?? "https://beta.focomues-iliad.fr";
  const fromEmail = normalizeFromEmail(
    Deno.env.get("NEWSLETTER_FROM")
      ?? Deno.env.get("CONTACT_REPLY_FROM")
      ?? Deno.env.get("FROM_EMAIL")
      ?? "FO COM UES ILIAD <contact@focomues-iliad.fr>"
  );

  if (!resendKey) return json({ error: "RESEND_API_KEY manquant" }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Non autorisé" }, 401);

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: serviceKey },
  });
  if (!userRes.ok) return json({ error: "Token invalide" }, 401);
  const { id: userId } = await userRes.json();

  const roleRes = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=in.(admin,secretaire,representant,redacteur)&select=role&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const roles = await roleRes.json();
  if (!Array.isArray(roles) || roles.length === 0) return json({ error: "Accès refusé" }, 403);

  const payload = await req.json();
  const newsletterId = payload?.newsletterId;
  const recipientEmails: string[] = Array.isArray(payload?.recipientEmails)
    ? Array.from(new Set(payload.recipientEmails
        .filter((email: unknown) => typeof email === "string" && email.includes("@"))
        .map((email: string) => email.trim().toLowerCase())))
    : [];

  if (!newsletterId) return json({ error: "newsletterId requis" }, 400);
  if (payload?.sendAll === true) return json({ error: "Envoi global interdit sur cette fonction." }, 400);
  if (recipientEmails.length === 0) return json({ error: "Aucun destinataire sélectionné." }, 400);
  if (recipientEmails.length > 10) return json({ error: "Maximum 10 destinataires par envoi." }, 400);

  const nlRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletters?id=eq.${newsletterId}&select=*&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const newsletters = await nlRes.json();
  if (!Array.isArray(newsletters) || newsletters.length !== 1) return json({ error: "Newsletter introuvable" }, 404);
  const newsletter = newsletters[0];

  const emailFilter = recipientEmails.map((email) => `"${email.replaceAll('"', '')}"`).join(",");
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletter_subscribers?is_active=eq.true&email=in.(${emailFilter})&select=email,unsubscribe_token`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const subscribers: Array<{ email: string; unsubscribe_token?: string | null }> = await subsRes.json();

  if (subscribers.length !== recipientEmails.length) {
    return json({
      error: "Certains destinataires sélectionnés ne sont pas actifs ou n'existent plus.",
      requestedRecipients: recipientEmails.length,
      activeRecipients: subscribers.length,
    }, 400);
  }

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
      successful_sends: 0,
      failed_sends: 0,
    }),
  });
  const sendRecords = await sendRes.json();
  const sendId: string | undefined = Array.isArray(sendRecords) ? sendRecords[0]?.id : undefined;

  const emails = subscribers.map((sub) => {
    const unsubParam = sub.unsubscribe_token
      ? `token=${sub.unsubscribe_token}`
      : `email=${encodeURIComponent(sub.email)}`;

    const bodyContent = newsletter.body_html?.trim().startsWith("<")
      ? newsletter.body_html
      : markdownToHtml(newsletter.body_html ?? "");

    return {
      from: fromEmail,
      to: [sub.email],
      subject: newsletter.subject,
      html: wrapHtml(
        bodyContent,
        `${siteUrl}/newsletter/unsubscribe?${unsubParam}`,
        siteUrl,
      ),
    };
  });

  const batchRes = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emails),
  });

  const success = batchRes.ok;
  const details = success ? null : await batchRes.text();

  if (sendId) {
    await fetch(`${supabaseUrl}/rest/v1/newsletter_sends?id=eq.${sendId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: success ? "completed" : "failed",
        successful_sends: success ? subscribers.length : 0,
        failed_sends: success ? 0 : subscribers.length,
        sent_at: new Date().toISOString(),
      }),
    });
  }

  if (!success) {
    console.error("Resend selected newsletter error:", details);
    return json({ error: "Erreur Resend lors de l'envoi", details }, 502);
  }

  return json({
    success: true,
    totalRecipients: subscribers.length,
    successfulSends: subscribers.length,
    failedSends: 0,
    requestedRecipients: recipientEmails.length,
    functionName: "send-newsletter-selected",
  });
});
