// deno-lint-ignore-file no-import-prefix
// The Supabase dashboard editor deploys index.ts without the repository deno.json.
import {
  PDFDocument,
  PDFRef,
  StandardFonts,
  rgb,
} from "npm:pdf-lib@1.17.1";

const DEFAULT_PDF_PATH = "/bulletin-adhesion.pdf";
const CONTACT_EMAIL = "contact@focomues-iliad.fr";
const ALLOWED_ORIGINS = new Set([
  "https://focomues-iliad.fr",
  "https://www.focomues-iliad.fr",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://focomues-iliad.fr",
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function postalCode(value: unknown) {
  return clean(value).replace(/\s/g, "").slice(0, 5);
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

function setFirstAvailableTextField(
  form: ReturnType<PDFDocument["getForm"]>,
  names: string[],
  value: string,
  options: { combed?: boolean } = {},
) {
  if (!value) return false;
  for (const name of names) {
    try {
      const field = form.getTextField(name);
      if (options.combed && !field.isCombed()) field.enableCombing();
      field.setText(value);
      return true;
    } catch {
      // champ absent dans le PDF officiel
    }
  }
  return false;
}

function checkFirstAvailableBox(
  form: ReturnType<PDFDocument["getForm"]>,
  names: string[],
) {
  for (const name of names) {
    try {
      form.getCheckBox(name).check();
      return name;
    } catch {
      // champ absent dans le PDF officiel
    }
  }
  return null;
}

type CheckBoxMark = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function collectCheckBoxMarks(
  pdfDoc: PDFDocument,
  form: ReturnType<PDFDocument["getForm"]>,
  fieldNames: string[],
) {
  const pages = pdfDoc.getPages();
  const marks: CheckBoxMark[] = [];

  for (const fieldName of fieldNames) {
    for (const widget of form.getCheckBox(fieldName).acroField.getWidgets()) {
      const pageIndex = pages.findIndex((page) => {
        const annotations = page.node.Annots();
        if (!annotations) return false;

        for (let index = 0; index < annotations.size(); index++) {
          const value = annotations.get(index);
          const annotation =
            value instanceof PDFRef ? pdfDoc.context.lookup(value) : value;
          if (annotation === widget.dict) return true;
        }
        return false;
      });
      const rect = widget.getRectangle();
      if (pageIndex >= 0) {
        marks.push({
          pageIndex,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }

  return marks;
}

function drawCheckBoxMarks(pdfDoc: PDFDocument, marks: CheckBoxMark[]) {
  const pages = pdfDoc.getPages();

  // The official PDF uses embedded symbol fonts that some viewers omit.
  // Vector marks keep checked boxes visible in every PDF renderer.
  for (const mark of marks) {
    const page = pages[mark.pageIndex];
    const thickness = Math.max(
      1,
      Math.min(mark.width, mark.height) * 0.13,
    );
    const start = {
      x: mark.x + mark.width * 0.18,
      y: mark.y + mark.height * 0.48,
    };
    const elbow = {
      x: mark.x + mark.width * 0.42,
      y: mark.y + mark.height * 0.18,
    };
    const end = {
      x: mark.x + mark.width * 0.82,
      y: mark.y + mark.height * 0.82,
    };

    page.drawLine({
      start,
      end: elbow,
      thickness,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: elbow,
      end,
      thickness,
      color: rgb(0, 0, 0),
    });
  }
}

function tryFillPdfForm(pdfDoc: PDFDocument, payload: Record<string, unknown>) {
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  if (fields.length === 0) {
    return { filled: false, fields: [] as string[], checkedBoxes: [] as string[] };
  }

  const fieldNames = fields.map((field) => field.getName());
  const civ = clean(payload.civilite).toLowerCase();
  const statut = clean(payload.statut).toLowerCase();
  const categorie = clean(payload.categorie).toLowerCase();
  const prelevement = clean(payload.prelevement).toLowerCase();
  const tempPartiel = clean(payload.tempPartiel);
  const checkedBoxes: string[] = [];

  setFirstAvailableTextField(form, ["nom", "Nom", "NOM", "last_name", "lastname"], clean(payload.nom));
  setFirstAvailableTextField(form, ["prenom", "Prénom", "Prenom", "PRENOM", "first_name", "firstname"], clean(payload.prenom));
  setFirstAvailableTextField(form, ["nom_prenom", "NomPrénom", "Nom et prénom", "adherent", "Adhérent"], fullName(payload));
  setFirstAvailableTextField(form, ["entreprise", "Entreprise", "etablissement", "Établissement", "Etablissement"], clean(payload.entreprise));
  setFirstAvailableTextField(form, ["nss", "NSS", "securite_sociale", "Sécurité sociale", "N° sécurité sociale"], clean(payload.nss));
  setFirstAvailableTextField(form, ["text_8kqdx", "classe", "Classe"], clean(payload.classe));
  setFirstAvailableTextField(form, ["text_9vfss", "niveau", "Niveau"], clean(payload.niveau));
  setFirstAvailableTextField(form, ["profession", "Profession"], clean(payload.profession));
  setFirstAvailableTextField(form, ["adresse_pers", "Adresse personnelle", "adresse", "Adresse"], clean(payload.adresse_pers));
  setFirstAvailableTextField(form, ["adresse_pers2", "Adresse personnelle 2", "adresse2", "Adresse 2"], clean(payload.adresse_pers2));
  setFirstAvailableTextField(
    form,
    ["cp_pers", "Code postal", "CP", "code_postal"],
    postalCode(payload.cp_pers),
    { combed: true },
  );
  setFirstAvailableTextField(form, ["commune_pers", "Commune", "ville", "Ville"], clean(payload.commune_pers));
  setFirstAvailableTextField(form, ["tel_fixe", "Téléphone fixe", "Telephone fixe", "telephone"], clean(payload.tel_fixe));
  setFirstAvailableTextField(form, ["portable", "Mobile", "mobile", "tel_mobile", "Téléphone portable"], clean(payload.portable));
  setFirstAvailableTextField(form, ["mail_pers", "Email", "email", "mail", "Courriel"], clean(payload.mail_pers));
  setFirstAvailableTextField(form, ["adresse_pro", "Adresse professionnelle", "adresse professionnelle"], clean(payload.adresse_pro));
  setFirstAvailableTextField(
    form,
    ["cp_pro", "CP professionnel", "Code postal professionnel"],
    postalCode(payload.cp_pro),
    { combed: true },
  );
  setFirstAvailableTextField(form, ["commune_pro", "Commune professionnelle", "Ville professionnelle"], clean(payload.commune_pro));
  setFirstAvailableTextField(form, ["tel_bureau", "Téléphone bureau", "Telephone bureau"], clean(payload.tel_bureau));
  setFirstAvailableTextField(form, ["mail_pro", "Email professionnel", "email professionnel"], clean(payload.mail_pro));
  setFirstAvailableTextField(form, ["date_debut", "Date début", "Date d'adhésion"], formatDateFr(payload.date_debut));
  setFirstAvailableTextField(form, ["lieu_debut", "Lieu", "Fait à", "fait_a"], clean(payload.lieu_debut));
  setFirstAvailableTextField(form, ["date_sign", "Date signature", "Fait le", "fait_le"], formatDateFr(payload.date_sign));

  const checkBox = (names: string[]) => {
    const checkedName = checkFirstAvailableBox(form, names);
    if (checkedName) checkedBoxes.push(checkedName);
  };

  if (civ === "mme") checkBox(["mme", "Mme", "Madame", "civilite_mme"]);
  if (civ === "mr") checkBox(["mr", "M", "Monsieur", "civilite_mr"]);
  if (statut) checkBox([statut, `statut_${statut}`]);
  if (categorie) checkBox([categorie, `categorie_${categorie}`]);
  if (tempPartiel) checkBox([tempPartiel]);
  if (prelevement === "oui") checkBox(["prelevement_oui", "prelevement oui", "oui"]);
  if (prelevement === "non") checkBox(["prelevement_non", "prelevement non", "non"]);

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

  return { filled: true, fields: fieldNames, checkedBoxes };
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

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  filename,
  pdfBase64,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo: string;
  filename: string;
  pdfBase64: string;
}) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("ADHESION_FROM_EMAIL") || CONTACT_EMAIL;
  if (!resendKey) throw new Error("Configuration e-mail indisponible.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `FO COM UES ILIAD <${fromEmail}>`,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      attachments: [{
        filename,
        content: pdfBase64,
      }],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Adhesion email delivery failed", response.status, details);
    throw new Error("L'e-mail n'a pas pu être envoyé.");
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405, headers);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "Origine non autorisée" }, 403, headers);
  }

  try {
    const payload = await req.json() as Record<string, unknown>;
    const deliveryMode = clean(payload.delivery_mode) || "download";
    const memberEmail = clean(payload.mail_pers).toLowerCase();
    const sendMemberCopy = payload.send_copy_to_member === true;

    if (deliveryMode === "email") {
      if (payload.email_consent !== true) {
        return json({ error: "Consentement e-mail requis" }, 400, headers);
      }
      if (!isValidEmail(memberEmail)) {
        return json({ error: "Adresse e-mail adhérent invalide" }, 400, headers);
      }
    }

    const pdfPayload = deliveryMode === "email"
      ? { ...payload, sepa: false }
      : payload;
    const officialPdfBytes = await fetchOfficialPdf(req);
    const pdfDoc = await PDFDocument.load(officialPdfBytes, { ignoreEncryption: true, updateMetadata: false });

    const formResult = await tryFillPdfForm(pdfDoc, pdfPayload);
    const checkedBoxMarks = formResult.filled
      ? collectCheckBoxMarks(pdfDoc, pdfDoc.getForm(), formResult.checkedBoxes)
      : [];
    if (!formResult.filled) {
      await drawFallback(pdfDoc, pdfPayload);
    }

    try {
      pdfDoc.getForm().updateFieldAppearances();
    } catch (error) {
      console.warn("Mise a jour des apparences PDF partielle", error);
    }
    drawCheckBoxMarks(pdfDoc, checkedBoxMarks);
    await addSignature(pdfDoc, clean(pdfPayload.signature_base64) || undefined);

    if (formResult.filled) {
      // Flattening this QuarkXPress form corrupts cross-reference entries
      // with pdf-lib. Read-only fields keep the document stable instead.
      for (const field of pdfDoc.getForm().getFields()) {
        field.enableReadOnly();
      }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    const base64 = uint8ToBase64(pdfBytes);
    const filename = `bulletin-adhesion-focom-${fileSafeName(payload)}.pdf`;

    if (deliveryMode === "email") {
      const memberName = escapeHtml(fullName(payload) || "Un adhérent");
      const memberEmailHtml = escapeHtml(memberEmail);
      const contactHtml = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
          <h2 style="color:#dc2626;margin:0 0 16px;">Nouveau bulletin d'adhésion</h2>
          <p><strong>${memberName}</strong> vous a transmis son bulletin d'adhésion.</p>
          <p><strong>Adresse de réponse :</strong> ${memberEmailHtml}</p>
          <p>Le bulletin joint ne contient pas les éventuelles coordonnées bancaires SEPA. Le mandat bancaire doit être transmis séparément par un canal sécurisé.</p>
        </div>
      `;
      await sendEmail({
        to: CONTACT_EMAIL,
        subject: `Adhésion FO COM - ${memberName}`,
        html: contactHtml,
        replyTo: memberEmail,
        filename,
        pdfBase64: base64,
      });

      let memberCopySent = false;
      let memberCopyError = false;
      if (sendMemberCopy) {
        const copyHtml = `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
            <h2 style="color:#dc2626;margin:0 0 16px;">Votre bulletin d'adhésion</h2>
            <p>Bonjour ${memberName},</p>
            <p>Voici une copie de votre bulletin d'adhésion, transmis à FO COM UES ILIAD.</p>
            <p>Les éventuelles coordonnées bancaires SEPA ne sont pas incluses dans cet e-mail et doivent être transmises par un canal sécurisé.</p>
          </div>
        `;
        try {
          await sendEmail({
            to: memberEmail,
            subject: "Copie de votre bulletin d'adhésion FO COM",
            html: copyHtml,
            replyTo: CONTACT_EMAIL,
            filename,
            pdfBase64: base64,
          });
          memberCopySent = true;
        } catch (error) {
          memberCopyError = true;
          console.error("Adhesion member copy delivery failed", error);
        }
      }

      return json({
        email_sent: true,
        member_copy_sent: memberCopySent,
        member_copy_error: memberCopyError,
        filename,
        filled_form_fields: formResult.filled,
      }, 200, headers);
    }

    return json({
      pdf: base64,
      filename,
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
