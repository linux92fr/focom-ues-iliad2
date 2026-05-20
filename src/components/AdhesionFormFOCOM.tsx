import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import {
  Download, Loader2, CheckCircle2, User, MapPin,
  FileText, CreditCard, PenLine, AlertCircle, Mail, MessageSquare,
} from "lucide-react";

interface FormData {
  civilite: "mme" | "mr" | "";
  nom: string; prenom: string; entreprise: string; nss: string;
  statut: "fonctionnaire" | "salarie" | "retraite" | "";
  categorie: "ouvrier" | "employe" | "maitrise" | "cadre" | "";
  classe: string; niveau: string; profession: string;
  tempPartiel: "50" | "60" | "70" | "80" | "";
  adresse_pers: string; adresse_pers2: string;
  cp_pers: string; commune_pers: string;
  tel_fixe: string; portable: string; mail_pers: string;
  adresse_pro: string; adresse_pro2: string;
  cp_pro: string; commune_pro: string;
  tel_bureau: string; mail_pro: string;
  date_debut: string; lieu_debut: string; date_sign: string;
  prelevement: "oui" | "non" | "";
  sepa: boolean;
  sepa_rum: string; sepa_nom: string;
  sepa_adresse: string; sepa_adresse2: string;
  sepa_cp: string; sepa_pays: string; sepa_ville: string;
  sepa_iban: string; sepa_bic: string; sepa_a: string; sepa_le: string;
}

const EMPTY: FormData = {
  civilite: "", nom: "", prenom: "", entreprise: "", nss: "",
  statut: "", categorie: "", classe: "", niveau: "", profession: "", tempPartiel: "",
  adresse_pers: "", adresse_pers2: "", cp_pers: "", commune_pers: "",
  tel_fixe: "", portable: "", mail_pers: "",
  adresse_pro: "", adresse_pro2: "", cp_pro: "", commune_pro: "",
  tel_bureau: "", mail_pro: "",
  date_debut: "", lieu_debut: "", date_sign: "", prelevement: "",
  sepa: false,
  sepa_rum: "", sepa_nom: "", sepa_adresse: "", sepa_adresse2: "",
  sepa_cp: "", sepa_pays: "France", sepa_ville: "",
  sepa_iban: "", sepa_bic: "", sepa_a: "", sepa_le: "",
};

const getInvokeErrorMessage = async (fnError: unknown) => {
  const fallback = fnError instanceof Error ? fnError.message : "Erreur Edge Function";
  const context = (fnError as { context?: Response } | null)?.context;
  if (!context) return fallback;

  try {
    const payload = await context.clone().json();
    return payload?.error || payload?.message || payload?.details || fallback;
  } catch {
    try {
      const text = await context.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
};

function Pill({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}>
      {label}
    </button>
  );
}

function SignatureCanvas({ onSignature }: { onSignature: (b64: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasContent = useRef(false);
  const [, forceRender] = useState(0);

  const getPos = (e: MouseEvent | TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const s = "touches" in e ? e.touches[0] : e;
    return { x: s.clientX - r.left, y: s.clientY - r.top };
  };

  const start = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const c = ref.current; if (!c) return;
    drawing.current = true;
    const p = getPos(e, c);
    c.getContext("2d")!.beginPath();
    c.getContext("2d")!.moveTo(p.x, p.y);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const p = getPos(e, c);
    ctx.lineTo(p.x, p.y); ctx.stroke();
    if (!hasContent.current) {
      hasContent.current = true;
      forceRender((value) => value + 1);
    }
    onSignature(c.toDataURL("image/png"));
  }, [onSignature]);

  const stop = useCallback(() => { drawing.current = false; }, []);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "#002060"; ctx.lineWidth = 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    c.addEventListener("mousedown", start);
    c.addEventListener("mousemove", draw);
    c.addEventListener("mouseup", stop);
    c.addEventListener("mouseleave", stop);
    c.addEventListener("touchstart", start, { passive: false });
    c.addEventListener("touchmove", draw, { passive: false });
    c.addEventListener("touchend", stop);
    return () => {
      c.removeEventListener("mousedown", start);
      c.removeEventListener("mousemove", draw);
      c.removeEventListener("mouseup", stop);
      c.removeEventListener("mouseleave", stop);
      c.removeEventListener("touchstart", start);
      c.removeEventListener("touchmove", draw);
      c.removeEventListener("touchend", stop);
    };
  }, [start, draw, stop]);

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 hover:border-primary/40 transition-colors">
        <canvas ref={ref} width={560} height={100}
          className="w-full cursor-crosshair touch-none block" style={{ height: 100 }} />
        {!hasContent.current && (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none select-none">
            Signez ici (souris ou doigt)
          </span>
        )}
      </div>
      <button type="button"
        onClick={() => {
          const c = ref.current; if (!c) return;
          c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
          hasContent.current = false;
          forceRender((value) => value + 1);
          onSignature(null);
        }}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors">
        Effacer la signature
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function AdhesionFormFOCOM() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [open, setOpen] = useState<string[]>(["identite"]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    set("date_sign", today);
    set("sepa_le", today);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-adhesion-pdf",
        {
          body: { ...form, signature_base64: signature ?? undefined },
        },
      );

      if (error) throw new Error(await getInvokeErrorMessage(error));
      if (data?.error) throw new Error(data.error);
      if (!data?.pdf) throw new Error("La fonction n'a pas retourné de PDF.");

      const binaryStr = atob(data.pdf);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "bulletin-adhesion-focom.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => setStatus("idle"), 12000);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("error");
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenLine className="w-5 h-5 text-primary" />
            Formulaire d'adhésion en ligne
          </CardTitle>
          <Badge variant="secondary" className="text-xs">PDF généré automatiquement</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Remplissez et signez — le bulletin FOCOM pré-rempli sera téléchargé.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-2">
            <AccordionItem value="identite" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4 text-primary" />
                  Identité
                  {(form.nom || form.prenom) && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {[form.civilite === "mme" ? "Mme" : form.civilite === "mr" ? "M." : "",
                        form.prenom, form.nom].filter(Boolean).join(" ")}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Civilité</Label>
                  <div className="flex gap-2">
                    <Pill label="Mme" checked={form.civilite === "mme"} onClick={() => set("civilite", "mme")} />
                    <Pill label="M." checked={form.civilite === "mr"}  onClick={() => set("civilite", "mr")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom *">
                    <Input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="DUPONT" className="h-8 text-sm" />
                  </Field>
                  <Field label="Prénom *">
                    <Input value={form.prenom} onChange={e => set("prenom", e.target.value)} placeholder="Marie" className="h-8 text-sm" />
                  </Field>
                </div>
                <Field label="Entreprise / Établissement">
                  <Input value={form.entreprise} onChange={e => set("entreprise", e.target.value)} placeholder="Free SA" className="h-8 text-sm" />
                </Field>
                <Field label="N° Sécu (7 premiers chiffres)">
                  <Input value={form.nss} onChange={e => set("nss", e.target.value.replace(/\D/g, "").slice(0, 7))} placeholder="2 85 05 …" className="h-8 text-sm font-mono" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Statut</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {([["fonctionnaire","Fonctionnaire"],["salarie","Salarié"],["retraite","Retraité"]] as const).map(([v,l]) =>
                        <Pill key={v} label={l} checked={form.statut === v} onClick={() => set("statut", v)} />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Catégorie</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {([["ouvrier","Ouvrier"],["employe","Employé"],["maitrise","Maîtrise"],["cadre","Cadre"]] as const).map(([v,l]) =>
                        <Pill key={v} label={l} checked={form.categorie === v} onClick={() => set("categorie", v)} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Classe"><Input value={form.classe} onChange={e => set("classe", e.target.value)} placeholder="A" className="h-8 text-sm" /></Field>
                  <Field label="Niveau"><Input value={form.niveau} onChange={e => set("niveau", e.target.value)} placeholder="3" className="h-8 text-sm" /></Field>
                  <Field label="Profession"><Input value={form.profession} onChange={e => set("profession", e.target.value)} placeholder="Ingénieur" className="h-8 text-sm" /></Field>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Temps partiel / CDD</Label>
                  <div className="flex gap-2">
                    {(["50","60","70","80"] as const).map(p =>
                      <Pill key={p} label={`${p}%`} checked={form.tempPartiel === p} onClick={() => set("tempPartiel", form.tempPartiel === p ? "" : p)} />
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="adresses" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-primary" />
                  Adresses &amp; contacts
                  {form.commune_pers && <Badge variant="outline" className="text-xs font-normal">{form.commune_pers}</Badge>}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">■ Personnelle</p>
                  <Field label="Adresse (ligne 1) *">
                    <Input value={form.adresse_pers} onChange={e => set("adresse_pers", e.target.value)} placeholder="12 rue des Lilas" className="h-8 text-sm" />
                  </Field>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2"><Field label="Code postal *"><Input value={form.cp_pers} onChange={e => set("cp_pers", e.target.value)} placeholder="75001" className="h-8 text-sm" /></Field></div>
                    <div className="col-span-3"><Field label="Commune *"><Input value={form.commune_pers} onChange={e => set("commune_pers", e.target.value)} placeholder="Paris" className="h-8 text-sm" /></Field></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tél. fixe"><Input type="tel" value={form.tel_fixe} onChange={e => set("tel_fixe", e.target.value)} placeholder="01 40 00 00 00" className="h-8 text-sm" /></Field>
                    <Field label="Portable"><Input type="tel" value={form.portable} onChange={e => set("portable", e.target.value)} placeholder="06 12 34 56 78" className="h-8 text-sm" /></Field>
                  </div>
                  <Field label="Email *"><Input type="email" value={form.mail_pers} onChange={e => set("mail_pers", e.target.value)} placeholder="marie@free.fr" className="h-8 text-sm" /></Field>
                </div>
                <div className="border-t pt-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">■ Professionnelle</p>
                  <Field label="Adresse"><Input value={form.adresse_pro} onChange={e => set("adresse_pro", e.target.value)} placeholder="1 place Carrée" className="h-8 text-sm" /></Field>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2"><Field label="Code postal"><Input value={form.cp_pro} onChange={e => set("cp_pro", e.target.value)} placeholder="93200" className="h-8 text-sm" /></Field></div>
                    <div className="col-span-3"><Field label="Commune"><Input value={form.commune_pro} onChange={e => set("commune_pro", e.target.value)} placeholder="Saint-Denis" className="h-8 text-sm" /></Field></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tél. bureau"><Input type="tel" value={form.tel_bureau} onChange={e => set("tel_bureau", e.target.value)} placeholder="01 40 00 00 01" className="h-8 text-sm" /></Field>
                    <Field label="Email pro"><Input type="email" value={form.mail_pro} onChange={e => set("mail_pro", e.target.value)} placeholder="marie.dupont@free.fr" className="h-8 text-sm" /></Field>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="declaration" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="w-4 h-4 text-primary" />
                  Déclaration &amp; signature
                  {signature && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Signée ✓</Badge>}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="bg-primary/5 border border-primary/10 rounded-md px-3 py-2 text-xs text-muted-foreground">
                  Déclare adhérer à la <strong>Fédération Syndicaliste Force Ouvrière de la Communication</strong>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="À partir du"><Input type="date" value={form.date_debut} onChange={e => set("date_debut", e.target.value)} className="h-8 text-sm" /></Field>
                  <Field label="À (lieu)"><Input value={form.lieu_debut} onChange={e => set("lieu_debut", e.target.value)} placeholder="Paris" className="h-8 text-sm" /></Field>
                  <Field label="Le (date)"><Input type="date" value={form.date_sign} onChange={e => set("date_sign", e.target.value)} className="h-8 text-sm" /></Field>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Prélèvement automatique des cotisations</Label>
                  <div className="flex gap-2">
                    <Pill label="✓ Je désire" checked={form.prelevement === "oui"} onClick={() => set("prelevement", "oui")} />
                    <Pill label="✗ Je ne désire pas" checked={form.prelevement === "non"} onClick={() => set("prelevement", "non")} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Signature *</Label>
                  <SignatureCanvas onSignature={setSignature} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sepa" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Mandat SEPA
                  <Badge variant={form.sepa ? "default" : "outline"} className="text-xs">{form.sepa ? "Activé" : "Optionnel"}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="flex items-center gap-3"><Switch checked={form.sepa} onCheckedChange={v => set("sepa", v)} /><span className="text-sm text-muted-foreground">Activer le prélèvement automatique</span></div>
                {form.sepa && (
                  <div className="space-y-3">
                    <Alert className="py-2 text-xs"><AlertDescription><strong>Identifiant créancier SEPA :</strong> FR 80 ZZZ 52 45 04 · Joindre un RIB comportant BIC-IBAN.</AlertDescription></Alert>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nom du débiteur"><Input value={form.sepa_nom} onChange={e => set("sepa_nom", e.target.value)} placeholder={`${form.nom} ${form.prenom}`.trim() || "DUPONT Marie"} className="h-8 text-sm" /></Field>
                      <Field label="Banque (A)"><Input value={form.sepa_a} onChange={e => set("sepa_a", e.target.value)} placeholder="BNP Paribas" className="h-8 text-sm" /></Field>
                    </div>
                    <Field label="Adresse débiteur"><Input value={form.sepa_adresse} onChange={e => set("sepa_adresse", e.target.value)} placeholder={form.adresse_pers || "12 rue des Lilas"} className="h-8 text-sm" /></Field>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Code postal"><Input value={form.sepa_cp} onChange={e => set("sepa_cp", e.target.value)} placeholder={form.cp_pers || "75001"} className="h-8 text-sm" /></Field>
                      <Field label="Ville"><Input value={form.sepa_ville} onChange={e => set("sepa_ville", e.target.value)} placeholder={form.commune_pers || "Paris"} className="h-8 text-sm" /></Field>
                      <Field label="Pays"><Input value={form.sepa_pays} onChange={e => set("sepa_pays", e.target.value)} placeholder="France" className="h-8 text-sm" /></Field>
                    </div>
                    <Field label="IBAN"><Input value={form.sepa_iban} onChange={e => set("sepa_iban", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="FR76 3000 6000 01 12 34 56 78 90 189" className="h-8 text-sm font-mono" /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="BIC"><Input value={form.sepa_bic} onChange={e => set("sepa_bic", e.target.value.toUpperCase())} placeholder="BNPAFRPP" className="h-8 text-sm font-mono" /></Field>
                      <Field label="Date du mandat"><Input type="date" value={form.sepa_le} onChange={e => set("sepa_le", e.target.value)} className="h-8 text-sm" /></Field>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {status === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errMsg}</AlertDescription>
            </Alert>
          )}
          {status === "success" && (
            <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Bulletin PDF généré et téléchargé avec succès.</p>
                    <p className="mt-1 text-sm">Vérifiez le document téléchargé, puis envoyez-le à votre section FO COM par email ou via la messagerie du site.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild size="sm" variant="outline" className="border-green-300 bg-white text-green-800 hover:bg-green-100"><Link to="/contact"><Mail className="mr-2 h-4 w-4" />Envoyer via Contact</Link></Button>
                    <Button asChild size="sm" variant="outline" className="border-green-300 bg-white text-green-800 hover:bg-green-100"><Link to="/mes-reclamations"><MessageSquare className="mr-2 h-4 w-4" />Transmettre via messagerie</Link></Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 mt-4">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Génération du bulletin officiel…</>
                : <><Download className="w-4 h-4" />Générer et télécharger le PDF</>}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setForm(EMPTY); setSignature(null); setStatus("idle"); setOpen(["identite"]); }}>Réinitialiser</Button>
          </div>
          {status === "loading" && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Merci de patienter quelques secondes, le PDF officiel est en cours de préparation.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground mt-3">Champs <span className="text-destructive">*</span> obligatoires</p>
        </form>
      </CardContent>
    </Card>
  );
}
