import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const DEFAULT_PDF_PATH = "/bulletin-adhesion.pdf";

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDateFr(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("fr-FR");
}

function fullName(payload: Record<string, unknown>) {
  return [clean(payload.prenom), clean(payload.nom)].filter(Boolean).join(" ");
}

function fileSafeName(payload: Record<string, unknown>) {
  const name = [clean(payload.nom), clean(payload.prenom)]
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return name || "adherent";
}

function uint8ToBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fetchOfficialPdf(req: Request) {
  const configuredUrl = Deno.env.get("ADHESION_PDF_URL");
  const origin = req.headers.get("origin");
  const fallbackBaseUrl = Deno.env.get("SITE_URL") || origin;

  if (!configuredUrl && !fallbackBaseUrl) {
    throw new Error("Définissez ADHESION_PDF_URL ou SITE_URL pour charger le bulletin officiel.");
  }

  const pdfUrl = configuredUrl || `${fallbackBaseUrl}${DEFAULT_PDF_PATH}`;
  const response = await fetch(pdfUrl, {
    headers: { "cache-control": "max-age=3600" },
  });

  if (!response.ok) {
    throw new Error(`PDF officiel introuvable (${response.status}) : ${pdfUrl}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function setFirstAvailableTextField(form: ReturnType<PDFDocument["getForm"]>, names: string[], value: string) {
  if (!value) return false;
  for (const name of names) {
    try {
      form.getTextField(name).setText(value);
      return true;
    } catch {
      // champ absent dans le PDF officiel
    }
  }
  return false;
}

function checkFirstAvailableBox(form: ReturnType<PDFDocument["getForm"]>, names: string[]) {
  for (const name of names) {
    try {
      form.getCheckBox(name).check();
      return true;
    } catch {
      // champ absent dans le PDF officiel
    }
  }
  return false;
}

async function tryFillPdfForm(pdfDoc: PDFDocument, payload: Record<string, unknown>) {
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  if (fields.length === 0) return { filled: false, fields: [] as string[] };

  const fieldNames = fields.map((field) => field.getName());
  const civ = clean(payload.civilite);
  const statut = clean(payload.statut);
  const categorie = clean(payload.categorie);
  const prelevement = clean(payload.prelevement);

  setFirstAvailableTextField(form, ["nom", "Nom", "NOM", "last_name", "lastname"], clean(payload.nom));
  setFirstAvailableTextField(form, ["prenom", "Prénom", "Prenom", "PRENOM", "first_name", "firstname"], clean(payload.prenom));
  setFirstAvailableTextField(form, ["nom_prenom", "NomPrénom", "Nom et prénom", "adherent", "Adhérent"], fullName(payload));
  setFirstAvailableTextField(form, ["entreprise", "Entreprise", "etablissement", "Établissement", "Etablissement"], clean(payload.entreprise));
  setFirstAvailableTextField(form, ["nss", "NSS", "securite_sociale", "Sécurité sociale", "N° sécurité sociale"], clean(payload.nss));
  setFirstAvailableTextField(form, ["classe", "Classe"], clean(payload.classe));
  setFirstAvailableTextField(form, ["niveau", "Niveau"], clean(payload.niveau));
  setFirstAvailableTextField(form, ["profession", "Profession"], clean(payload.profession));
  setFirstAvailableTextField(form, ["adresse_pers", "Adresse personnelle", "adresse", "Adresse"], clean(payload.adresse_pers));
  setFirstAvailableTextField(form, ["adresse_pers2", "Adresse personnelle 2", "adresse2", "Adresse 2"], clean(payload.adresse_pers2));
  setFirstAvailableTextField(form, ["cp_pers", "Code postal", "CP", "code_postal"], clean(payload.cp_pers));
  setFirstAvailableTextField(form, ["commune_pers", "Commune", "ville", "Ville"], clean(payload.commune_pers));
  setFirstAvailableTextField(form, ["tel_fixe", "Téléphone fixe", "Telephone fixe", "telephone"], clean(payload.tel_fixe));
  setFirstAvailableTextField(form, ["portable", "Mobile", "mobile", "tel_mobile", "Téléphone portable"], clean(payload.portable));
  setFirstAvailableTextField(form, ["mail_pers", "Email", "email", "mail", "Courriel"], clean(payload.mail_pers));
  setFirstAvailableTextField(form, ["adresse_pro", "Adresse professionnelle", "adresse professionnelle"], clean(payload.adresse_pro));
  setFirstAvailableTextField(form, ["cp_pro", "CP professionnel", "Code postal professionnel"], clean(payload.cp_pro));
  setFirstAvailableTextField(form, ["commune_pro", "Commune professionnelle", "Ville professionnelle"], clean(payload.commune_pro));
  setFirstAvailableTextField(form, ["tel_bureau", "Téléphone bureau", "Telephone bureau"], clean(payload.tel_bureau));
  setFirstAvailableTextField(form, ["mail_pro", "Email professionnel", "email professionnel"], clean(payload.mail_pro));
  setFirstAvailableTextField(form, ["date_debut", "Date début", "Date d'adhésion"], formatDateFr(payload.date_debut));
  setFirstAvailableTextField(form, ["lieu_debut", "Lieu", "Fait à", "fait_a"], clean(payload.lieu_debut));
  setFirstAvailableTextField(form, ["date_sign", "Date signature", "Fait le", "fait_le"], formatDateFr(payload.date_sign));

  if (civ === "mme") checkFirstAvailableBox(form, ["mme", "Mme", "Madame", "civilite_mme"]);
  if (civ === "mr") checkFirstAvailableBox(form, ["mr", "M", "Monsieur", "civilite_mr"]);
  if (statut) checkFirstAvailableBox(form, [statut, `statut_${statut}`]);
  if (categorie) checkFirstAvailableBox(form, [categorie, `categorie_${categorie}`]);
  if (prelevement === "oui") checkFirstAvailableBox(form, ["prelevement_oui", "prelevement oui", "oui"]);
  if (prelevement === "non") checkFirstAvailableBox(form, ["prelevement_non", "prelevement non", "non"]);

  if (payload.sepa) {
    setFirstAvailableTextField(form, ["sepa_nom", "Nom débiteur", "debiteur_nom"], clean(payload.sepa_nom) || fullName(payload));
    setFirstAvailableTextField(form, ["sepa_adresse", "Adresse débiteur", "debiteur_adresse"], clean(payload.sepa_adresse));
    setFirstAvailableTextField(form, ["sepa_cp", "CP débiteur", "debiteur_cp"], clean(payload.sepa_cp));
    setFirstAvailableTextField(form, ["sepa_ville", "Ville débiteur", "debiteur_ville"], clean(payload.sepa_ville));
    setFirstAvailableTextField(form, ["sepa_pays", "Pays débiteur", "debiteur_pays"], clean(payload.sepa_pays));
    setFirstAvailableTextField(form, ["sepa_iban", "IBAN", "iban"], clean(payload.sepa_iban));
    setFirstAvailableTextField(form, ["sepa_bic", "BIC", "bic"], clean(payload.sepa_bic));
    setFirstAvailableTextField(form, ["sepa_a", "Banque", "banque"], clean(payload.sepa_a));
    setFirstAvailableTextField(form, ["sepa_le", "Date mandat", "date_mandat"], formatDateFr(payload.sepa_le));
  }

  return { filled: true, fields: fieldNames };
}

async function drawFallback(pdfDoc: PDFDocument, payload: Record<string, unknown>) {
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  const color = rgb(0.04, 0.13, 0.32);

  page.drawText("Bulletin d'adhésion FO COM - données saisies en ligne", {
    x: 45,
    y: height - 55,
    size: 11,
    font: bold,
    color,
  });

  const rows = [
    ["Civilité", clean(payload.civilite)],
    ["Nom", clean(payload.nom)],
    ["Prénom", clean(payload.prenom)],
    ["Entreprise", clean(payload.entreprise)],
    ["N° sécurité sociale", clean(payload.nss)],
    ["Statut", clean(payload.statut)],
    ["Catégorie", clean(payload.categorie)],
    ["Classe / niveau", [clean(payload.classe), clean(payload.niveau)].filter(Boolean).join(" / ")],
    ["Profession", clean(payload.profession)],
    ["Adresse personnelle", [clean(payload.adresse_pers), clean(payload.adresse_pers2)].filter(Boolean).join(" ")],
    ["CP / Commune", [clean(payload.cp_pers), clean(payload.commune_pers)].filter(Boolean).join(" ")],
    ["Téléphone", [clean(payload.tel_fixe), clean(payload.portable)].filter(Boolean).join(" / ")],
    ["Email personnel", clean(payload.mail_pers)],
    ["Email pro", clean(payload.mail_pro)],
    ["Adhésion à partir du", formatDateFr(payload.date_debut)],
    ["Fait à / le", [clean(payload.lieu_debut), formatDateFr(payload.date_sign)].filter(Boolean).join(" le ")],
    ["Prélèvement", clean(payload.prelevement)],
  ];

  let y = height - 80;
  for (const [label, value] of rows) {
    if (!value) continue;
    page.drawText(`${label} :`, { x: 45, y, size: 8.5, font: bold, color });
    page.drawText(String(value).slice(0, 90), { x: 150, y, size: 8.5, font, color });
    y -= 14;
  }
}

async function addSignature(pdfDoc: PDFDocument, signatureBase64: string | undefined) {
  if (!signatureBase64) return;
  const page = pdfDoc.getPages()[0];
  const imageBytes = Uint8Array.from(atob(signatureBase64.split(",").pop() || ""), (char) => char.charCodeAt(0));
  const png = await pdfDoc.embedPng(imageBytes);
  page.drawImage(png, {
    x: 95,
    y: 42,
    width: 170,
    height: 50,
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405, headers);

  try {
    const payload = await req.json();
    const officialPdfBytes = await fetchOfficialPdf(req);
    const pdfDoc = await PDFDocument.load(officialPdfBytes, { ignoreEncryption: true, updateMetadata: false });

    const formResult = await tryFillPdfForm(pdfDoc, payload);
    if (!formResult.filled) {
      await drawFallback(pdfDoc, payload);
    }

    await addSignature(pdfDoc, clean(payload.signature_base64) || undefined);

    try {
      pdfDoc.getForm().flatten();
    } catch {
      // PDF non formulaire ou champs non compatibles
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    const base64 = uint8ToBase64(pdfBytes);

    return json({
      pdf: base64,
      filename: `bulletin-adhesion-focom-${fileSafeName(payload)}.pdf`,
      filled_form_fields: formResult.filled,
      fields_detected: formResult.fields,
    }, 200, headers);
  } catch (error) {
    console.error("generate-adhesion-pdf error", error);
    return json({
      error: error instanceof Error ? error.message : "Erreur inconnue lors de la génération du PDF",
    }, 500, headers);
  }
});
