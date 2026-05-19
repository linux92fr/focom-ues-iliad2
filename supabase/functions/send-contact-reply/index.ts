import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReplyPayload {
  messageId: string;
  reply: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br />");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("CONTACT_REPLY_FROM") || "FO COM UES ILIAD <contact@focomues-iliad.fr>";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return jsonResponse({ error: "Missing server configuration" }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (userError || !userResult.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data: allowedRole, error: roleError } = await supabase.rpc("has_any_role", {
    _user_id: userResult.user.id,
    _roles: ["admin", "secretaire", "representant"],
  });

  if (roleError || !allowedRole) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let payload: ReplyPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!payload.messageId || !payload.reply?.trim()) {
    return jsonResponse({ error: "messageId and reply are required" }, 400);
  }

  const { data: message, error: messageError } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message")
    .eq("id", payload.messageId)
    .single();

  if (messageError || !message) {
    return jsonResponse({ error: "Contact message not found" }, 404);
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
      <h2 style="color:#dc2626;margin:0 0 16px;">Réponse FO COM UES ILIAD</h2>
      <p>Bonjour ${escapeHtml(message.name || "")},</p>
      <p>Nous vous répondons suite à votre message :</p>
      <div style="background:#f8fafc;border-left:4px solid #0d9488;padding:12px 16px;margin:16px 0;">
        <strong>${escapeHtml(message.subject || "Votre message")}</strong><br />
        <span style="font-size:13px;color:#64748b;">${escapeHtml(message.message || "")}</span>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
        ${escapeHtml(payload.reply.trim())}
      </div>
      <p style="font-size:13px;color:#64748b;">Solidairement,<br />L'équipe FO COM UES ILIAD</p>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [message.email],
      subject: `Réponse FO COM - ${message.subject || "votre message"}`,
      html,
    }),
  });

  const resendResult = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    return jsonResponse({ error: "Email delivery failed", details: resendResult }, 502);
  }

  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({
      status: "repondu",
      admin_reply: payload.reply.trim(),
      replied_at: new Date().toISOString(),
    })
    .eq("id", payload.messageId);

  if (updateError) {
    return jsonResponse({ error: "Email sent but database update failed" }, 500);
  }

  return jsonResponse({ success: true, email: resendResult });
});
