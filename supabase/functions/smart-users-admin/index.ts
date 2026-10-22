import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "https://focomues-iliad.fr,https://www.focomues-iliad.fr")
  .split(",").map((value) => value.trim()).filter(Boolean);

function cors(origin: string | null): Record<string, string> {
  const allowed = origin !== null && (ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405, headers);
  if (headers["Access-Control-Allow-Origin"] === "null") return json({ error: "Origine non autorisée." }, 403, headers);
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) return json({ error: "Configuration serveur incomplète." }, 503, headers);

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token || token === authorization) return json({ error: "Authentification requise." }, 401, headers);

  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await callerClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Session invalide ou expirée." }, 401, headers);

  const { data: callerRoles, error: callerRoleError } = await callerClient.from("user_roles").select("role").eq("user_id", authData.user.id);
  if (callerRoleError || !(callerRoles ?? []).some((row) => row.role === "admin")) {
    return json({ error: "Accès réservé aux administrateurs." }, 403, headers);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  let payload: { action?: string; email?: string; password?: string; userId?: string };
  try { payload = await req.json(); } catch { return json({ error: "Corps JSON invalide." }, 400, headers); }
  const action = payload.action;

  if (action === "list") {
    const { data: roleRows, error: rolesError } = await admin.from("user_roles").select("user_id").eq("role", "utilisateur_ia");
    if (rolesError) return json({ error: "Impossible de lire les comptes Smart." }, 500, headers);
    const ids = [...new Set((roleRows ?? []).map((row) => row.user_id as string))];
    const users = [];
    for (const id of ids) {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (error || !data.user) continue;
      users.push({
        id: data.user.id,
        email: data.user.email ?? "",
        created_at: data.user.created_at ?? null,
        disabled: Boolean(data.user.banned_until && new Date(data.user.banned_until).getTime() > Date.now()),
      });
    }
    users.sort((a, b) => a.email.localeCompare(b.email));
    return json({ users }, 200, headers);
  }

  if (action === "create") {
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
      return json({ error: "Adresse e-mail invalide ou mot de passe de 12 à 128 caractères requis." }, 400, headers);
    }
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createError || !created.user) {
      return json({ error: createError?.message?.includes("already") ? "Cette adresse e-mail possède déjà un compte." : "Création du compte impossible." }, 400, headers);
    }
    const { error: roleInsertError } = await admin.from("user_roles").insert({ user_id: created.user.id, role: "utilisateur_ia" });
    if (roleInsertError) {
      await admin.auth.admin.deleteUser(created.user.id);
      console.error("Smart role assignment failed", roleInsertError.message);
      return json({ error: "Le rôle Smart n'a pas pu être attribué. Le compte créé a été annulé." }, 500, headers);
    }
    return json({ user: { id: created.user.id, email: created.user.email } }, 201, headers);
  }

  if (action === "disable" || action === "enable") {
    const userId = typeof payload.userId === "string" ? payload.userId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ error: "Identifiant utilisateur invalide." }, 400, headers);
    }
    const { data: smartRole, error: smartRoleError } = await admin.from("user_roles").select("user_id").eq("user_id", userId).eq("role", "utilisateur_ia").maybeSingle();
    if (smartRoleError || !smartRole) return json({ error: "Ce compte n'est pas un utilisateur Smart." }, 404, headers);
    const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: action === "disable" ? "876000h" : "none" });
    if (error) return json({ error: "Impossible de modifier l'état du compte." }, 500, headers);
    return json({ success: true }, 200, headers);
  }

  return json({ error: "Action inconnue." }, 400, headers);
});
