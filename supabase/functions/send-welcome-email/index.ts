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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email, unsubscribeToken } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://focom-ues-iliad.fr";
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "newsletter@focom-ues-iliad.fr";

    if (!resendKey) return json({ error: "RESEND_API_KEY manquant" }, 500);
    if (!email || !unsubscribeToken) return json({ error: "Paramètres manquants" }, 400);

    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue dans la newsletter FOCOM UES ILIAD</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td>
      <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:#dc2626;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">FOCOM UES ILIAD</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Fédération des Organisations de Communication</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">Bienvenue dans notre newsletter&nbsp;!</h2>
            <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
              Merci de vous être abonné à la newsletter <strong>FOCOM UES ILIAD</strong>. Vous recevrez désormais
              nos actualités, informations syndicales et communications importantes directement dans votre boîte mail.
            </p>
            <p style="color:#475569;line-height:1.7;margin:0 0 32px;">
              Votre syndicat FO COM UES ILIAD défend vos droits et vous tient informé des dernières actualités
              concernant Free, Free Mobile, Free Réseau et l'ensemble du groupe Iliad.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background:#dc2626;border-radius:8px;">
                  <a href="${siteUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">
                    Visiter notre site
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">
              Vous recevez cet email car vous vous êtes abonné sur
              <a href="${siteUrl}" style="color:#dc2626;">${siteUrl.replace("https://", "")}</a>
            </p>
            <p style="margin:0;">
              <a href="${unsubscribeUrl}" style="color:#94a3b8;font-size:12px;text-decoration:underline;">
                Se désabonner
              </a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `FOCOM UES ILIAD <${fromEmail}>`,
        to: [email],
        subject: "Bienvenue dans la newsletter FOCOM UES ILIAD",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return json({ error: "Erreur envoi email" }, 502);
    }

    return json({ success: true });
  } catch {
    return json({ error: "Erreur serveur" }, 500);
  }
});
