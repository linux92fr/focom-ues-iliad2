const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const NEWSLETTER_BATCH_SIZE = 20;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

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
                    <img src="https://focomues-iliad.fr/logo-focom.png" width="64" height="64" alt="FO COM UES ILIAD" style="display:inline-block;vertical-align:middle;width:64px;height:64px;background:#ffffff;border-radius:16px;padding:4px;" />
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
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? Deno.env.get("SITE_URL") ?? "https://focomues-iliad.fr";
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
  const sendAll = payload?.sendAll === true;
  const recipientEmails: string[] = Array.isArray(payload?.recipientEmails)
    ? Array.from(new Set(payload.recipientEmails
        .filter((email: unknown) => typeof email === "string" && email.includes("@"))
        .map((email: string) => email.trim().toLowerCase())))
    : [];

  if (!newsletterId) return json({ error: "newsletterId requis" }, 400);
  if (!sendAll && recipientEmails.length === 0) return json({ error: "Aucun destinataire sélectionné." }, 400);
  if (!sendAll && recipientEmails.length > NEWSLETTER_BATCH_SIZE) {
    return json({ error: `Maximum ${NEWSLETTER_BATCH_SIZE} destinataires par envoi sélectionné.` }, 400);
  }

  const runningSendRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletter_sends?newsletter_id=eq.${newsletterId}&status=eq.sending&select=id&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const runningSends = await runningSendRes.json();
  if (Array.isArray(runningSends) && runningSends.length > 0) {
    return json({ error: "Un envoi de cette newsletter est déjà en cours." }, 409);
  }

  const nlRes = await fetch(
    `${supabaseUrl}/rest/v1/newsletters?id=eq.${newsletterId}&select=*&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const newsletters = await nlRes.json();
  if (!Array.isArray(newsletters) || newsletters.length !== 1) return json({ error: "Newsletter introuvable" }, 404);
  const newsletter = newsletters[0];

  const subscribersQuery = sendAll
    ? `${supabaseUrl}/rest/v1/newsletter_subscribers?is_active=eq.true&select=email,unsubscribe_token&order=subscribed_at.asc`
    : (() => {
        const emailFilter = recipientEmails.map((email) => `"${email.replaceAll('"', '')}"`).join(",");
        return `${supabaseUrl}/rest/v1/newsletter_subscribers?is_active=eq.true&email=in.(${emailFilter})&select=email,unsubscribe_token`;
      })();
  const subsRes = await fetch(subscribersQuery, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  const subscribers: Array<{ email: string; unsubscribe_token?: string | null }> = await subsRes.json();

  if (!sendAll && subscribers.length !== recipientEmails.length) {
    return json({
      error: "Certains destinataires sélectionnés ne sont pas actifs ou n'existent plus.",
      requestedRecipients: recipientEmails.length,
      activeRecipients: subscribers.length,
    }, 400);
  }
  if (subscribers.length === 0) {
    return json({ error: "Aucun abonné actif disponible." }, 400);
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

  let successful = 0;
  let failed = 0;
  const failureDetails: string[] = [];

  for (let offset = 0; offset < subscribers.length; offset += NEWSLETTER_BATCH_SIZE) {
    const chunk = subscribers.slice(offset, offset + NEWSLETTER_BATCH_SIZE);
    const emails = chunk.map((sub) => {
      const unsubParam = sub.unsubscribe_token
        ? `token=${sub.unsubscribe_token}`
        : `email=${encodeURIComponent(sub.email)}`;

      return {
        from: fromEmail,
        to: [sub.email],
        subject: newsletter.subject,
        html: wrapHtml(
          newsletter.body_html,
          `${siteUrl}/newsletter/unsubscribe?${unsubParam}`,
          siteUrl,
        ),
      };
    });

    try {
      const batchRes = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emails),
      });

      if (batchRes.ok) {
        successful += chunk.length;
      } else {
        failed += chunk.length;
        failureDetails.push((await batchRes.text()).slice(0, 500));
      }
    } catch (error) {
      failed += chunk.length;
      failureDetails.push(error instanceof Error ? error.message : String(error));
    }
  }

  const success = failed === 0;
  const partial = successful > 0 && failed > 0;
  const details = failureDetails.length > 0 ? failureDetails.join("\n").slice(0, 2000) : null;

  if (sendId) {
    await fetch(`${supabaseUrl}/rest/v1/newsletter_sends?id=eq.${sendId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: success ? "completed" : partial ? "partial" : "failed",
        successful_sends: successful,
        failed_sends: failed,
        sent_at: new Date().toISOString(),
        error_details: details,
      }),
    });
  }

  if (!success) {
    console.error("Resend selected newsletter error:", details);
    return json({ error: "Erreur Resend lors de l'envoi", details }, 502);
  }

  return json({
    success,
    partial,
    totalRecipients: subscribers.length,
    successfulSends: successful,
    failedSends: failed,
    requestedRecipients: sendAll ? subscribers.length : recipientEmails.length,
    sendAll,
    functionName: "send-newsletter-selected",
  });
});
