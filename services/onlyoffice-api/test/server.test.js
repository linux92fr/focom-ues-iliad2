import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import jwt from "jsonwebtoken";

process.env.PORT = "0";
process.env.PUBLIC_API_URL = "https://api.test";
process.env.ONLYOFFICE_URL = "https://docs.test";
process.env.ONLYOFFICE_JWT_SECRET = "onlyoffice-test-secret";
process.env.SUPABASE_URL = "https://project.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon-test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test";
process.env.CORS_ORIGINS = "https://focomues-iliad.fr";

const realFetch = globalThis.fetch;
const uploads = [];
const updates = [];
const documentRow = {
  id: "11111111-1111-4111-8111-111111111111",
  file_name: "document.docx",
  file_path: "public/document.docx",
  file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  file_size: 1024,
  storage_provider: "supabase",
  updated_at: "2026-11-23T12:00:00.000Z",
};

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  const method = String(init.method || "GET").toUpperCase();

  if (url === "https://project.supabase.co/auth/v1/user") {
    return jsonResponse({
      id: "22222222-2222-4222-8222-222222222222",
      email: "admin@example.com",
      user_metadata: { display_name: "Admin FO COM" },
    });
  }
  if (url === "https://project.supabase.co/rest/v1/rpc/has_any_role") {
    return jsonResponse(true);
  }
  if (url.startsWith("https://project.supabase.co/rest/v1/documents?id=eq.")) {
    if (method === "PATCH") {
      updates.push(JSON.parse(String(init.body || "{}")));
      return new Response(null, { status: 204 });
    }
    return jsonResponse([documentRow]);
  }
  if (
    url ===
      "https://project.supabase.co/storage/v1/object/sign/documents/public/document.docx"
  ) {
    return jsonResponse({
      signedURL: "/object/sign/documents/public/document.docx?token=source-token",
    });
  }
  if (url === "https://docs.test/cache/document.docx") {
    return new Response(new TextEncoder().encode("%PDF-1.7 edited"), {
      status: 200,
      headers: { "content-type": "application/pdf" },
    });
  }
  if (
    url ===
      "https://project.supabase.co/storage/v1/object/documents/public/document.docx"
  ) {
    uploads.push({
      body: new TextDecoder().decode(init.body),
      contentType: init.headers["content-type"],
    });
    return jsonResponse({});
  }

  return realFetch(input, init);
};

const { app } = await import(
  `../src/server.js?test=${Date.now()}`
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

test("config endpoint returns a signed ONLYOFFICE configuration", async () => {
  const response = await realFetch(`${baseUrl}/api/onlyoffice/config`, {
    method: "POST",
    headers: {
      authorization: "Bearer supabase-user-token",
      "content-type": "application/json",
      origin: "https://focomues-iliad.fr",
    },
    body: JSON.stringify({ documentId: documentRow.id, mode: "edit" }),
  });
  assert.equal(response.status, 200);

  const { config } = await response.json();
  const signed = jwt.verify(
    config.token,
    process.env.ONLYOFFICE_JWT_SECRET,
    { algorithms: ["HS256"] },
  );
  assert.equal(signed.document.fileType, "docx");
  assert.equal(signed.documentType, "word");
  assert.equal(signed.document.url.includes("source-token"), true);
  assert.equal(
    signed.editorConfig.callbackUrl,
    "https://api.test/api/onlyoffice/callback",
  );
  assert.equal(signed.editorConfig.user.name, "Admin FO COM");
});

test("callback token is verified and the edited file is saved", async () => {
  const callbackPayload = {
    key: `doc:${documentRow.id}:version`,
    status: 2,
    url: "https://docs.test/cache/document.docx",
  };
  const token = jwt.sign(
    callbackPayload,
    process.env.ONLYOFFICE_JWT_SECRET,
    { algorithm: "HS256" },
  );
  const response = await realFetch(`${baseUrl}/api/onlyoffice/callback`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...callbackPayload, token }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { error: 0 });
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].body, "%PDF-1.7 edited");
  assert.equal(uploads[0].contentType, "application/pdf");
  assert.equal(updates.length, 1);
  assert.equal(updates[0].file_size, 15);
});

test.after(() => {
  server.close();
  globalThis.fetch = realFetch;
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
