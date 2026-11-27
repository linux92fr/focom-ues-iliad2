// Rappels quotidiens du calendrier de l'Avent FO COM UES Iliad (1er au 24 décembre).
// RGPD : finalité unique (rappel de l'événement), consentement explicite,
// désinscription en un clic, purge automatique des adresses après l'événement.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL =
  Deno.env.get("PUBLIC_SITE_URL") ??
  Deno.env.get("SITE_URL") ??
  "https://focomues-iliad.fr";
const FROM_EMAIL =
  Deno.env.get("NEWSLETTER_FROM") ??
  Deno.env.get("CONTACT_REPLY_FROM") ??
  "FO COM UES ILIAD <contact@focomues-iliad.fr>";

const restHeaders: Record<string, string> = {
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
  "Content-Type": "application/json",
};

function parisParts(): { y: number; m: number; d: number } {
  const raw = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = raw.split("-").map(Number);
  return { y, m, d };
}

function wrapAventHtml(bodyHtml: string, unsubUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#241812;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#241812;padding:32px 16px;">
    <tr><td>
      <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#f6ead3;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#b3402f;padding:24px 40px;text-align:center;">
            <div style="margin-bottom:12px;"><img src="https://focomues-iliad.fr/logo-focom.png" width="76" height="76" alt="FO COM UES ILIAD" style="display:inline-block;width:76px;height:76px;background:#ffffff;border-radius:12px;padding:6px;" /></div>
            <h1 style="color:#f6ead3;margin:0;font-size:20px;font-weight:700;">🎄 Calendrier de l'Avent FO COM</h1>
          </td>
        </tr>
        <tr><td style="padding:36px 40px;color:#3a2a1e;line-height:1.7;font-size:15px;">
          ${bodyHtml}
        </td></tr>
        <tr>
          <td style="background:#efe0c2;padding:18px 40px;text-align:center;border-top:1px solid #d9c19a;">
            <p style="color:#8a6a3a;font-size:11px;margin:0 0 6px;">
              Vous recevez cet email car vous avez demandé à être rappelé chaque jour du calendrier de l'Avent de la FO COM UES Iliad (consentement explicite). Désinscription possible à tout moment.
            </p>
            <p style="margin:0;">
              <a href="${unsubUrl}" style="color:#b3402f;font-size:12px;font-weight:bold;">Se désinscrire</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendBatch(
  items: { email: string; subject: string; html: string }[],
): Promise<boolean> {
  if (!RESEND_KEY || items.length === 0) return items.length === 0;
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      items.map((item) => ({ from: FROM_EMAIL, to: [item.email], subject: item.subject, html: item.html })),
    ),
  });
  if (!res.ok) {
    console.error("Resend batch failed", res.status, await res.text());
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  try {
    // --- Inscription avec consentement explicite ---
    if (url.pathname.endsWith("/subscribe")) {
      const body = await req.json();
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 255) {
        return json({ error: "Adresse email invalide" }, 400);
      }
      const token = crypto.randomUUID();
      const existingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/avent_reminders?email=eq.${encodeURIComponent(email)}&select=id,is_active&limit=1`,
        { headers: restHeaders },
      );
      const existing = await existingRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        if (existing[0].is_active) return json({ success: true, already: true });
        const reactivateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/avent_reminders?id=eq.${existing[0].id}`,
          {
            method: "PATCH",
            headers: restHeaders,
            body: JSON.stringify({
              is_active: true,
              unsubscribe_token: token,
              consented_at: new Date().toISOString(),
              unsubscribed_at: null,
              sent_at: null,
            }),
          },
        );
        if (!reactivateRes.ok) throw new Error("reactivation failed");
      } else {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/avent_reminders`, {
          method: "POST",
          headers: restHeaders,
          body: JSON.stringify({ email, unsubscribe_token: token, is_active: true }),
        });
        if (!insertRes.ok) throw new Error("insert failed");
      }
      // Email de confirmation (best effort, sans bloquer l'inscription)
      await sendBatch([
        {
          email,
          subject: "Calendrier de l'Avent : rappel activé 🎄",
          html: wrapAventHtml(
            `<h2 style="margin:0 0 12px;font-size:18px;">C'est noté !</h2>
             <p style="margin:0 0 16px;">Vous recevrez chaque matin du <strong>1er au 24 décembre</strong> un email pour vous rappeler d'ouvrir la case du jour du calendrier de l'Avent. À très vite !</p>
             <p style="text-align:center;margin:28px 0;">
               <a href="${SITE_URL}/avent" style="background:#b3402f;color:#f6ead3;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:bold;font-size:15px;">Voir le calendrier</a>
             </p>`,
            `${SITE_URL}/avent?desinscription=${token}`,
          ),
        },
      ]);
      return json({ success: true });
    }

    // --- Désinscription en un clic (idempotente, sans énumération possible) ---
    if (url.pathname.endsWith("/unsubscribe")) {
      const body = await req.json().catch(() => ({}));
      const token = typeof body?.token === "string" ? body.token.trim() : "";
      if (!token || token.length > 200) return json({ error: "Jeton manquant" }, 400);
      await fetch(
        `${SUPABASE_URL}/rest/v1/avent_reminders?unsubscribe_token=eq.${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: restHeaders,
          body: JSON.stringify({ is_active: false, unsubscribed_at: new Date().toISOString() }),
        },
      );
      return json({ success: true });
    }

    // --- Envoi quotidien (appelé par pg_cron avec le secret, ou par un gestionnaire connecté) ---
    if (url.pathname.endsWith("/send")) {
      const cronSecret = req.headers.get("x-cron-secret") ?? "";
      const authHeader = req.headers.get("Authorization") ?? "";
      let authorized = false;
      if (cronSecret) {
        const secretRes = await fetch(
          `${SUPABASE_URL}/rest/v1/avent_cron?id=eq.1&select=secret&limit=1`,
          { headers: restHeaders },
        );
        const rows = await secretRes.json();
        authorized = Array.isArray(rows) && rows.length > 0 && rows[0].secret === cronSecret;
      } else if (authHeader.startsWith("Bearer ")) {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { Authorization: authHeader, apikey: SERVICE_KEY },
        });
        if (userRes.ok) {
          const user = await userRes.json();
          const roleRes = await fetch(
            `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${user.id}&role=in.(admin,secretaire,representant)&select=role&limit=1`,
            { headers: restHeaders },
          );
          const roles = await roleRes.json();
          authorized = Array.isArray(roles) && roles.length > 0;
        }
      }
      if (!authorized) return json({ error: "Non autorisé" }, 401);

      const { y, m, d } = parisParts();
      if (y !== 2026 || m !== 12 || d < 1 || d > 24) {
        return json({ skipped: true, reason: "hors période de l'événement" });
      }
      const dayStartIso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00+01:00`;
      const subsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/avent_reminders?is_active=eq.true&or=(sent_at.is.null,sent_at.lt.${encodeURIComponent(dayStartIso)})&select=id,email,unsubscribe_token&order=created_at.asc&limit=1000`,
        { headers: restHeaders },
      );
      const subscribers = await subsRes.json();
      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        return json({ success: true, sent: 0, day: d });
      }
      const subject = `Calendrier de l'Avent : Jour ${d}, la case est ouverte !`;
      const sentIds: string[] = [];
      let okAll = true;
      for (let i = 0; i < subscribers.length; i += 50) {
        const chunk = subscribers.slice(i, i + 50);
        const items = chunk.map((sub: { email: string; unsubscribe_token?: string | null }) => ({
          email: sub.email,
          subject,
          html: wrapAventHtml(
            `<h2 style="margin:0 0 12px;font-size:18px;">Jour ${d} : la case est ouverte !</h2>
             <p style="margin:0 0 16px;">Une nouvelle case vient de se déverrouiller : le quiz du jour vous attend, avec sa surprise (fait marquant, citation ou anecdote du monde du travail).</p>
             <p style="text-align:center;margin:28px 0;">
               <a href="${SITE_URL}/avent" style="background:#b3402f;color:#f6ead3;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:bold;font-size:15px;">Ouvrir la case du jour 🎁</a>
             </p>
             <p style="margin:0;font-size:13px;">Les cases des jours précédents restent ouvertes : rattrapez-les quand vous voulez.</p>`,
            `${SITE_URL}/avent?desinscription=${sub.unsubscribe_token ?? ""}`,
          ),
        }));
        const ok = await sendBatch(items);
        if (ok) sentIds.push(...chunk.map((s: { id: string }) => s.id));
        else okAll = false;
      }
      if (sentIds.length > 0) {
        const idFilter = sentIds.map((id) => `"${id}"`).join(",");
        await fetch(`${SUPABASE_URL}/rest/v1/avent_reminders?id=in.(${idFilter})`, {
          method: "PATCH",
          headers: restHeaders,
          body: JSON.stringify({ sent_at: new Date().toISOString() }),
        });
      }
      return json({ success: okAll, sent: sentIds.length, day: d });
    }

    return json({ error: "Route inconnue" }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: "Erreur interne" }, 500);
  }
});
