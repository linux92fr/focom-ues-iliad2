import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const BUCKET = "user-documents";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_FILE_SIZE / 3) * 4 + 128;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeBase64(b64: string): Uint8Array {
  const comma = b64.indexOf(",");
  const raw = b64.startsWith("data:") && comma !== -1 ? b64.slice(comma + 1) : b64;
  if (raw.length > MAX_BASE64_LENGTH) throw new Error("Fichier trop volumineux");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) throw new Error("Base64 invalide");
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function hasSignature(bytes: Uint8Array, type: string): boolean {
  const starts = (sig: number[]) => sig.every((v, i) => bytes[i] === v);
  if (type === "application/pdf") return starts([0x25, 0x50, 0x44, 0x46]);
  if (type === "image/jpeg") return starts([0xff, 0xd8, 0xff]);
  if (type === "image/png") return starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === "image/gif") return starts([0x47, 0x49, 0x46, 0x38]);
  if (type === "image/webp") return starts([0x52, 0x49, 0x46, 0x46]) && bytes.length > 11 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (type.includes("word") || type.includes("excel")) return starts([0x50, 0x4b, 0x03, 0x04]);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Non authentifié" }, 401);

    const body = await req.json();
    const { fileBase64, fileName, contentType, title, description, isPublic, folderId } = body ?? {};

    if (typeof fileBase64 !== "string" || typeof fileName !== "string") return json({ error: "Fichier requis" }, 400);
    if (fileName.length === 0 || fileName.length > 255) return json({ error: "Nom de fichier invalide" }, 400);
    if (typeof title !== "string" || !title.trim() || title.length > 200) return json({ error: "Titre requis ou trop long" }, 400);

    const finalContentType = typeof contentType === "string" ? contentType.toLowerCase().trim() : "";
    if (!ALLOWED_TYPES.has(finalContentType)) return json({ error: "Type de fichier non autorisé" }, 415);

    const bytes = decodeBase64(fileBase64);
    if (bytes.byteLength === 0) return json({ error: "Fichier vide" }, 400);
    if (bytes.byteLength > MAX_FILE_SIZE) return json({ error: "Le fichier dépasse 20 Mo" }, 400);
    if (!hasSignature(bytes, finalContentType)) return json({ error: "Le contenu du fichier ne correspond pas à son type déclaré" }, 415);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    let safeFolderId: string | null = null;
    if (folderId) {
      const { data: folder } = await admin
        .from("document_folders")
        .select("id")
        .eq("id", String(folderId))
        .eq("user_id", user.id)
        .maybeSingle();
      if (!folder) return json({ error: "Dossier invalide" }, 400);
      safeFolderId = folder.id;
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 180);
    const path = user.id + "/" + crypto.randomUUID() + "-" + safeName;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: finalContentType,
      upsert: false,
    });
    if (upErr) {
      console.error("[upload-user-document] storage error:", upErr.message);
      return json({ error: "Échec de l'enregistrement du fichier" }, 502);
    }

    const { data: inserted, error: insErr } = await admin.from("user_documents").insert({
      user_id: user.id,
      title: title.trim(),
      description: typeof description === "string" ? description.trim().slice(0, 2000) || null : null,
      file_name: fileName,
      file_path: path,
      file_size: bytes.byteLength,
      file_type: finalContentType,
      is_public: isPublic === true,
      folder_id: safeFolderId,
    }).select("id").single();

    if (insErr) {
      await admin.storage.from(BUCKET).remove([path]);
      console.error("[upload-user-document] insert error:", insErr.message);
      return json({ error: "Erreur lors de l'enregistrement" }, 500);
    }

    return json({ success: true, id: inserted?.id, path });
  } catch (err) {
    console.error("[upload-user-document] unexpected:", err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
