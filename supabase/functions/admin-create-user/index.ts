import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // JWT vérifié par le gateway (verify_jwt: true)
  // Vérification que l'appelant est bien admin
  const authHeader = req.headers.get("Authorization") ?? "";
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (callerError || !caller) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: callerRoles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id);
  const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, password, firstName, lastName, role } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email et mot de passe requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: `${firstName ?? ""} ${lastName ?? ""}`.trim() },
    });
    if (error) throw error;
    const userId = data.user.id;

    // Mise à jour du profil si nom fourni
    if (firstName || lastName) {
      await adminClient.from("profiles").update({
        first_name: firstName || null,
        last_name: lastName || null,
      }).eq("id", userId);
    }

    // Attribution du rôle
    const assignedRole = role || "adherent";
    await adminClient.from("user_roles").insert({
      user_id: userId,
      role: assignedRole,
      assigned_by: caller.id,
    });

    // Envoi de l'email avec le lien de définition du mot de passe
    // (email_confirm: true ci-dessus désactive l'email de confirmation automatique de Supabase,
    // il faut donc explicitement notifier le nouvel utilisateur)
    try {
      const credentialsResp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-user-credentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ email, firstName, lastName, role: assignedRole }),
        }
      );
      if (!credentialsResp.ok) {
        console.error("send-user-credentials failed:", await credentialsResp.text());
      }
    } catch (emailErr) {
      console.error("send-user-credentials call error:", emailErr);
    }

    return new Response(JSON.stringify({ success: true, userId, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
