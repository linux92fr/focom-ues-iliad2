import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, TrendingUp, Upload, FileText, Loader2, X, Sparkles, AlertCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
type CollegeForm = {
  nom: string;
  tit_inscrits: string; tit_votants: string; tit_taux: string;
  sup_inscrits: string; sup_votants: string; sup_taux: string;
  taux_college: string;
};

const defaultCollege = (nom: string, inscrits: string = ''): CollegeForm => ({
  nom,
  tit_inscrits: inscrits, tit_votants: '', tit_taux: '',
  sup_inscrits: inscrits, sup_votants: '', sup_taux: '',
  taux_college: '',
});

// ── Chargement PDF.js depuis CDN (une seule fois) ────────────────────────────
async function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) return resolve((window as any).pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(lib);
    };
    script.onerror = () => reject(new Error('Impossible de charger PDF.js'));
    document.head.appendChild(script);
  });
}

// ── Extraction du texte brut ─────────────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return fullText;
}

// ── Parser regex sur le texte extrait ───────────────────────────────────────
const toNum = (s: string) => s.replace(/\s/g, '').replace(',', '.').trim();

function parsePDFText(text: string) {
  const t = text.replace(/\s+/g, ' ');

  // Date JJ/MM/AAAA
  const dateMatch = t.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  const date = dateMatch
    ? `${dateMatch[1].padStart(2, '0')}/${dateMatch[2].padStart(2, '0')}/${dateMatch[3]}`
    : '';

  // Heure Xh ou XhXX
  const heureMatch = t.match(/(\d{1,2})[hH](\d{2})?(?!\d)/);
  const heure = heureMatch
    ? heureMatch[2] ? `${heureMatch[1]}h${heureMatch[2]}` : `${heureMatch[1]}h`
    : '';

  // Taux établissement
  const tauxEtabMatch =
    t.match(/[ée]tablissement[^%\d]{0,30}(\d{1,3}[,\.]\d{1,2})\s*%?/i) ||
    t.match(/taux\s+global[^%\d]{0,30}(\d{1,3}[,\.]\d{1,2})/i) ||
    t.match(/participation[^%\d]{0,30}(\d{1,3}[,\.]\d{1,2})\s*%/i);
  const tauxEtab = tauxEtabMatch ? toNum(tauxEtabMatch[1]) : '';

  // Collège Employés/Techniciens uniquement (T2)
  const cp = { nom: 'TECHNICIENS, EMPLOYÉS, NON CADRES', re: /technicien|non.cadre|employ[ée]/i };
  const idx = t.search(cp.re);
  let college: any = { nom: cp.nom };

  if (idx !== -1) {
    const block = t.slice(idx, idx + 500);
    const allNums = [...block.matchAll(/\b(\d{1,6}(?:[,\.]\d{1,2})?)\b/g)]
      .map(m => toNum(m[1]))
      .filter(n => !isNaN(parseFloat(n)));

    const gros   = allNums.filter(n => parseFloat(n) >= 100 && !n.includes('.'));
    const petits = allNums.filter(n => {
      const v = parseFloat(n);
      return v > 0 && v < 100 && n.includes('.');
    });

    college = {
      nom:          cp.nom,
      tit_inscrits: gros[0]   ?? '',
      tit_votants:  gros[1]   ?? '',
      tit_taux:     petits[0] ?? '',
      sup_inscrits: gros[2]   ?? gros[0] ?? '',
      sup_votants:  gros[3]   ?? '',
      sup_taux:     petits[1] ?? '',
      taux_college: petits[2] ?? '',
    };
  }

  return { date, heure, tauxEtab, college };
}

// ── Composant ────────────────────────────────────────────────────────────────
const AdminParticipation = () => {
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [tauxEtab, setTauxEtab] = useState('');
  // T2 : un seul collège (inscrits fixes : 2774)
  const [college, setCollege] = useState<CollegeForm>(
    defaultCollege('TECHNICIENS, EMPLOYÉS, NON CADRES', '2774')
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCollege = (field: keyof CollegeForm, value: string) => {
    setCollege(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'tit_votants' || field === 'tit_inscrits') {
        const ins = parseFloat(field === 'tit_inscrits' ? value : prev.tit_inscrits);
        const vot = parseFloat(field === 'tit_votants'  ? value : prev.tit_votants);
        if (ins > 0 && vot >= 0) updated.tit_taux = ((vot / ins) * 100).toFixed(2);
      }
      if (field === 'sup_votants' || field === 'sup_inscrits') {
        const ins = parseFloat(field === 'sup_inscrits' ? value : prev.sup_inscrits);
        const vot = parseFloat(field === 'sup_votants'  ? value : prev.sup_votants);
        if (ins > 0 && vot >= 0) updated.sup_taux = ((vot / ins) * 100).toFixed(2);
      }
      const tit = parseFloat(updated.tit_taux);
      const sup = parseFloat(updated.sup_taux);
      if (!isNaN(tit) && !isNaN(sup)) updated.taux_college = ((tit + sup) / 2).toFixed(2);
      return updated;
    });
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') { setExtractError('Seuls les PDF sont acceptés.'); return; }
    setPdfFile(file); setExtractError(''); setExtractSuccess(false); setRawText('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const removePdf = () => {
    setPdfFile(null); setExtractError(''); setExtractSuccess(false); setRawText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = async () => {
    if (!pdfFile) return;
    setExtracting(true); setExtractError(''); setExtractSuccess(false);
    try {
      const text = await extractTextFromPDF(pdfFile);
      setRawText(text);

      const parsed = parsePDFText(text);
      if (parsed.date)     setDate(parsed.date);
      if (parsed.heure)    setHeure(parsed.heure);
      if (parsed.tauxEtab) setTauxEtab(parsed.tauxEtab);

      const match = parsed.college;
      if (match) {
        setCollege(prev => ({
          ...prev,
          // inscrits figés (2774) — on ne les écrase jamais
          tit_votants:  match.tit_votants  || prev.tit_votants,
          tit_taux:     match.tit_taux     || prev.tit_taux,
          sup_votants:  match.sup_votants  || prev.sup_votants,
          sup_taux:     match.sup_taux     || prev.sup_taux,
          taux_college: match.taux_college || prev.taux_college,
        }));
      }
      setExtractSuccess(true);
    } catch (e: any) {
      setExtractError(e.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      const { data: snap, error: snapErr } = await supabase
        .from('participation_snapshots')
        .insert({ date, heure, taux_etablissement: parseFloat(tauxEtab) })
        .select().single();
      if (snapErr || !snap) throw new Error(snapErr?.message || 'Erreur snapshot');

      const { error: colErr } = await supabase.from('participation_colleges').insert([{
        snapshot_id: snap.id,
        nom: college.nom,
        display_order: 0,
        tit_inscrits: parseInt(college.tit_inscrits),
        tit_votants: parseInt(college.tit_votants),
        tit_taux: parseFloat(college.tit_taux),
        sup_inscrits: parseInt(college.sup_inscrits),
        sup_votants: parseInt(college.sup_votants),
        sup_taux: parseFloat(college.sup_taux),
        taux_college: parseFloat(college.taux_college),
      }]);
      if (colErr) throw new Error(colErr.message);

      setSuccess(true);
      setDate(''); setHeure(''); setTauxEtab('');
      setPdfFile(null); setRawText(''); setExtractSuccess(false);
      setCollege(defaultCollege('TECHNICIENS, EMPLOYÉS, NON CADRES', '2774'));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relevé de participation — 2e tour</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Collège Techniciens / Employés / Non-Cadres · 29 avril – 6 mai 2026
            </p>
          </div>
        </div>

        {/* Badge tour */}
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20 px-4 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            2ème tour en cours · Seul le collège Employés/Techniciens/Non-Cadres est concerné
          </p>
        </div>

        {/* ── Zone upload PDF ── */}
        <Card className="border-purple-200 dark:border-purple-800/40 bg-purple-50/30 dark:bg-purple-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
              Import automatique depuis un PDF
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Traitement 100% local — aucune donnée envoyée à l'extérieur.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">

            {!pdfFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 scale-[1.01]'
                    : 'border-purple-300 dark:border-purple-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                }`}
              >
                <Upload className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Glissez un PDF ici ou <span className="underline underline-offset-2">cliquez pour parcourir</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF uniquement · traitement local</p>
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/20 px-4 py-3">
                <FileText className="h-5 w-5 text-purple-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pdfFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024).toFixed(1)} Ko</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500" onClick={removePdf}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {extractSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-green-700 text-sm font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Données extraites — vérifiez et corrigez si besoin avant d'enregistrer.
              </div>
            )}
            {extractError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-xs">
                {extractError}
              </div>
            )}

            <Button onClick={handleExtract} disabled={!pdfFile || extracting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              {extracting
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Lecture du PDF…</>
                : <><Sparkles className="h-4 w-4 mr-2" />Extraire les données</>}
            </Button>

            {rawText && (
              <div>
                <button className="text-xs text-muted-foreground underline underline-offset-2"
                  onClick={() => setShowRaw(v => !v)}>
                  {showRaw ? 'Masquer' : 'Voir'} le texte brut (débogage)
                </button>
                {showRaw && (
                  <pre className="mt-2 text-[10px] bg-muted rounded p-3 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
                    {rawText}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                L'extraction dépend du format du PDF. Utilisez le texte brut si des valeurs sont manquantes pour ajuster manuellement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Formulaire relevé ── */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informations du relevé</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Date (ex: 29/04/2026)</Label>
              <Input placeholder="29/04/2026" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Heure (ex: 10h)</Label>
              <Input placeholder="10h" value={heure} onChange={e => setHeure(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Taux établissement (%)</Label>
              <Input placeholder="22.22" type="number" step="0.01" value={tauxEtab} onChange={e => setTauxEtab(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* ── Collège unique T2 ── */}
        <Card className="border-red-200 dark:border-red-800/40">
          <CardHeader>
            <CardTitle className="text-base text-red-700 dark:text-red-400">
              Collège : {college.nom}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Inscrits figés · 2 774 électeurs</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Titulaires</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Inscrits</Label>
                  <Input type="number" value={college.tit_inscrits} readOnly className="bg-muted cursor-not-allowed" /></div>
                <div className="space-y-1"><Label className="text-xs">Votants</Label>
                  <Input type="number" value={college.tit_votants} onChange={e => updateCollege('tit_votants', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Taux (%)</Label>
                  <Input type="number" step="0.01" value={college.tit_taux} readOnly className="bg-muted cursor-not-allowed" /></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Suppléants</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Inscrits</Label>
                  <Input type="number" value={college.sup_inscrits} readOnly className="bg-muted cursor-not-allowed" /></div>
                <div className="space-y-1"><Label className="text-xs">Votants</Label>
                  <Input type="number" value={college.sup_votants} onChange={e => updateCollege('sup_votants', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Taux (%)</Label>
                  <Input type="number" step="0.01" value={college.sup_taux} readOnly className="bg-muted cursor-not-allowed" /></div>
              </div>
            </div>
            <div className="w-40">
              <Label className="text-xs">Taux collège (%)</Label>
              <Input type="number" step="0.01" value={college.taux_college} readOnly className="bg-muted cursor-not-allowed" />
            </div>
          </CardContent>
        </Card>

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 font-semibold">
            <CheckCircle className="h-4 w-4" /> Relevé enregistré avec succès !
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            Erreur : {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={saving || !date || !heure || !tauxEtab}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 text-base">
          {saving ? 'Enregistrement...' : '💾 Enregistrer ce relevé'}
        </Button>
      </div>
    </div>
  );
};

export default AdminParticipation;
