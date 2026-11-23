import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import cors from "cors";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

const PORT = Number(process.env.PORT || 3001);
const PUBLIC_API_URL = requiredEnv("PUBLIC_API_URL").replace(/\/+$/, "");
const ONLYOFFICE_URL = requiredEnv("ONLYOFFICE_URL").replace(/\/+$/, "");
const ONLYOFFICE_JWT_SECRET = requiredEnv("ONLYOFFICE_JWT_SECRET");
const SUPABASE_URL = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = requiredEnv("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || "documents";
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "https://focomues-iliad.fr")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ROLES = (process.env.ONLYOFFICE_ALLOWED_ROLES || "admin,representant,gestionnaire_documents")
  .split(",")
  .map((role) => role.trim())
  .filter(Boolean);

const EDITOR_TYPES = {
  doc: "word",
  docm: "word",
  docx: "word",
  dot: "word",
  dotm: "word",
  dotx: "word",
  odt: "word",
  ott: "word",
  rtf: "word",
  txt: "word",
  csv: "cell",
  ods: "cell",
  ots: "cell",
  xls: "cell",
  xlsm: "cell",
  xlsx: "cell",
  xlt: "cell",
  xltm: "cell",
  xltx: "cell",
  odp: "slide",
  otp: "slide",
  pot: "slide",
  potm: "slide",
  potx: "slide",
  pps: "slide",
  ppsm: "slide",
  ppsx: "slide",
  ppt: "slide",
  pptm: "slide",
  pptx: "slide",
  pdf: "pdf",
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

function bearerToken(request) {
  const match = String(request.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
  if (!match) throw new HttpError(401, "Session Supabase requise.");
  return match[1];
}

function supabaseHeaders(token, extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    authorization: `Bearer ${token}`,
    ...extra,
  };
}

async function requireEditorUser(request) {
  const token = bearerToken(request);
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${token}`,
    },
  });
  if (!userResponse.ok) throw new HttpError(401, "Session Supabase invalide.");

  const user = await userResponse.json();
  const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_any_role`, {
    method: "POST",
    headers: supabaseHeaders(token, { "content-type": "application/json" }),
    body: JSON.stringify({
      _user_id: user.id,
      _roles: ALLOWED_ROLES,
    }),
  });
  if (!roleResponse.ok) throw new HttpError(403, "Vérification des autorisations impossible.");
  const allowed = await roleResponse.json();
  if (allowed !== true) throw new HttpError(403, "Vous n'êtes pas autorisé à modifier ce document.");

  return { token, user };
}

async function loadDocument(documentId, token) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}&select=id,file_name,file_path,file_type,file_size,storage_provider,updated_at`,
    { headers: supabaseHeaders(token) },
  );
  if (!response.ok) throw new HttpError(500, "Impossible de charger les informations du document.");
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) throw new HttpError(404, "Document introuvable.");
  if (rows[0].storage_provider !== "supabase") {
    throw new HttpError(400, "Ce document doit être modifié dans son stockage d'origine.");
  }
  return rows[0];
}

function fileExtension(fileName) {
  return path.extname(fileName || "").slice(1).toLowerCase();
}

function documentVersionKey(document) {
  const version = crypto
    .createHash("sha256")
    .update(`${document.file_path}:${document.updated_at || ""}:${document.file_size || 0}`)
    .digest("hex")
    .slice(0, 24);
  return `doc:${document.id}:${version}`;
}

function encodeStoragePath(filePath) {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

async function createSignedSourceUrl(filePath) {
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(DOCUMENTS_BUCKET)}/${encodeStoragePath(filePath)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    },
  );
  if (!response.ok) throw new HttpError(500, "Impossible de générer le lien temporaire du document.");
  const data = await response.json();
  return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

async function saveDocumentToSupabase(document, bytes, contentType) {
  const uploadResponse = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(DOCUMENTS_BUCKET)}/${encodeStoragePath(document.file_path)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": contentType,
        "x-upsert": "true",
      },
      body: bytes,
    },
  );
  if (!uploadResponse.ok) throw new Error("Impossible d'enregistrer le document dans Supabase Storage.");

  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/documents?id=eq.${encodeURIComponent(document.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({
        file_size: bytes.byteLength,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!updateResponse.ok) throw new Error("Le fichier est enregistré, mais sa fiche n'a pas pu être mise à jour.");
}

function verifyCallbackToken(token) {
  if (!token || typeof token !== "string") {
    throw new HttpError(401, "Jeton de callback ONLYOFFICE manquant.");
  }
  const verified = jwt.verify(token, ONLYOFFICE_JWT_SECRET, {
    algorithms: ["HS256"],
  });
  if (!verified || typeof verified !== "object") {
    throw new HttpError(401, "Jeton de callback ONLYOFFICE invalide.");
  }
  return verified.payload && typeof verified.payload === "object"
    ? verified.payload
    : verified;
}

const app = express();
app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new HttpError(403, "Origine non autorisée."));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["authorization", "content-type"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "256kb" }));

app.get("/api/onlyoffice/health", async (_request, response) => {
  try {
    const upstream = await fetch(`${ONLYOFFICE_URL}/healthcheck`, {
      signal: AbortSignal.timeout(5000),
    });
    response.status(upstream.ok ? 200 : 502).json({
      ok: upstream.ok,
      onlyoffice: upstream.ok,
    });
  } catch {
    response.status(502).json({ ok: false, onlyoffice: false });
  }
});

app.post("/api/onlyoffice/config", async (request, response, next) => {
  try {
    const { token, user } = await requireEditorUser(request);
    const documentId = String(request.body?.documentId || "").trim();
    const mode = request.body?.mode === "view" ? "view" : "edit";
    if (!/^[0-9a-f-]{36}$/i.test(documentId)) {
      throw new HttpError(400, "Identifiant de document invalide.");
    }

    const document = await loadDocument(documentId, token);
    const extension = fileExtension(document.file_name);
    const documentType = EDITOR_TYPES[extension];
    if (!documentType) throw new HttpError(415, "Ce format n'est pas pris en charge par ONLYOFFICE.");

    const config = {
      document: {
        fileType: extension,
        key: documentVersionKey(document),
        title: document.file_name,
        url: await createSignedSourceUrl(document.file_path),
        permissions: {
          edit: mode === "edit",
          download: true,
          print: true,
          comment: mode === "edit",
          review: mode === "edit",
        },
      },
      documentType,
      editorConfig: {
        callbackUrl: `${PUBLIC_API_URL}/api/onlyoffice/callback`,
        lang: "fr",
        mode,
        user: {
          id: String(user.id),
          name:
            user.user_metadata?.display_name ||
            user.email ||
            "Utilisateur FO COM",
        },
        customization: {
          compactHeader: false,
          forcesave: true,
          help: false,
          hideRightMenu: true,
        },
      },
      type: "desktop",
    };
    config.token = jwt.sign(config, ONLYOFFICE_JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "12h",
    });

    response.json({ config });
  } catch (error) {
    next(error);
  }
});

app.post("/api/onlyoffice/callback", async (request, response) => {
  try {
    const callback = verifyCallbackToken(request.body?.token);
    const status = Number(callback.status);
    const externalDocumentKey = String(callback.key || request.body?.key || "");
    const match = externalDocumentKey.match(/^doc:([0-9a-f-]{36}):/i);
    if (!match) throw new HttpError(400, "Clé de document invalide.");

    if (status === 2 || status === 6) {
      const documentUrl = String(callback.url || "");
      if (!documentUrl) throw new HttpError(400, "URL du document modifié manquante.");

      const document = await loadDocumentWithServiceRole(match[1]);
      const downloadResponse = await fetch(documentUrl, {
        headers: { authorization: `Bearer ${request.body.token}` },
      });
      if (!downloadResponse.ok) throw new Error("Impossible de télécharger le document modifié.");
      const bytes = new Uint8Array(await downloadResponse.arrayBuffer());
      await saveDocumentToSupabase(
        document,
        bytes,
        downloadResponse.headers.get("content-type") || "application/octet-stream",
      );
    }

    response.json({ error: 0 });
  } catch (error) {
    console.error("ONLYOFFICE callback error", error instanceof Error ? error.message : error);
    response.status(error.status || 500).json({ error: 1 });
  }
});

async function loadDocumentWithServiceRole(documentId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}&select=id,file_name,file_path,file_type,file_size,storage_provider,updated_at`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!response.ok) throw new Error("Impossible de retrouver le document à enregistrer.");
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error("Document à enregistrer introuvable.");
  return rows[0];
}

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error("ONLYOFFICE API error", error instanceof Error ? error.message : error);
  }
  response.status(status).json({
    error: error instanceof Error ? error.message : "Erreur interne.",
  });
});

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMainModule) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ONLYOFFICE API listening on port ${PORT}`);
  });
}

export {
  app,
  documentVersionKey,
  fileExtension,
  verifyCallbackToken,
};
