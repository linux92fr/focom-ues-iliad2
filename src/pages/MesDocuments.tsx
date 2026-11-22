import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PortalPageHero } from "@/components/PortalPageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import {
  Plus, FileText, Download, Trash2, Loader2, Lock, Globe, FolderOpen, Folder,
  ChevronRight, Upload, Eye, X,
} from "lucide-react";

interface DocumentFolder {
  id: string;
  name: string;
}

interface UserDocument {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_public: boolean;
  folder_id: string | null;
  created_at: string;
}

const BUCKET = "user-documents";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const SHEET_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const PREVIEWABLE_TYPES = [...IMAGE_TYPES, "application/pdf", DOCX_TYPE, ...SHEET_TYPES, "text/plain"];
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "gif", "webp", "txt"];
const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: DOCX_TYPE,
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain",
};

const isPreviewable = (fileType: string | null) => !!fileType && PREVIEWABLE_TYPES.includes(fileType);

const getFileExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

const getFileContentType = (file: File) => {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type;
  return EXTENSION_CONTENT_TYPES[getFileExtension(file.name)] ?? (file.type || "application/octet-stream");
};

const isAllowedFile = (file: File) => {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return true;
  return ALLOWED_EXTENSIONS.includes(getFileExtension(file.name));
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const fmtSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
};

function getSupabaseErrorMessage(error: { code?: string; message?: string } | null) {
  if (!error) return "Erreur inconnue";
  if (error.code === "42501") return "Accès refusé par Supabase/RLS. Vérifiez les policies de la table user_documents.";
  return error.message || "Erreur inconnue";
}

const ROOT_FOLDER = "__root__";
const ALL_FOLDERS = "__all__";

export default function MesDocuments() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>(ALL_FOLDERS);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);

  const fetchFolders = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("document_folders")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    if (!error) setFolders(data ?? []);
  }, [user]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setDocuments(data ?? []);
    else toast.error(`Impossible de charger vos documents : ${getSupabaseErrorMessage(error)}`);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const timer = window.setTimeout(() => {
      void fetchDocuments();
      void fetchFolders();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, fetchDocuments, fetchFolders]);

  const togglePublic = async (doc: UserDocument) => {
    const { error } = await supabase
      .from("user_documents")
      .update({ is_public: !doc.is_public })
      .eq("id", doc.id);
    if (error) return toast.error(`Impossible de mettre à jour : ${getSupabaseErrorMessage(error)}`);
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_public: !d.is_public } : d)));
    toast.success(doc.is_public ? "Document rendu privé" : "Document rendu public");
  };

  const handleDownload = async (doc: UserDocument) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 60);
    if (error || !data?.signedUrl) return toast.error("Impossible de télécharger le fichier");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (doc: UserDocument) => {
    if (!window.confirm(`Supprimer "${doc.title}" définitivement ?`)) return;
    await supabase.storage.from(BUCKET).remove([doc.file_path]);
    const { error } = await supabase.from("user_documents").delete().eq("id", doc.id);
    if (error) return toast.error(`Impossible de supprimer : ${getSupabaseErrorMessage(error)}`);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document supprimé");
  };

  const handleDeleteFolder = async (folder: DocumentFolder) => {
    if (!window.confirm(`Supprimer le dossier "${folder.name}" ? Les documents qu'il contient ne seront pas supprimés.`)) return;
    const { error } = await supabase.from("document_folders").delete().eq("id", folder.id);
    if (error) return toast.error(`Impossible de supprimer le dossier : ${getSupabaseErrorMessage(error)}`);
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    setDocuments((prev) => prev.map((d) => (d.folder_id === folder.id ? { ...d, folder_id: null } : d)));
    if (activeFolder === folder.id) setActiveFolder(ALL_FOLDERS);
    toast.success("Dossier supprimé");
  };

  const visibleDocuments = documents.filter((d) => {
    if (activeFolder === ALL_FOLDERS) return true;
    if (activeFolder === ROOT_FOLDER) return !d.folder_id;
    return d.folder_id === activeFolder;
  });

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          Chargement de votre bibliothèque…
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
        <div className="mx-auto max-w-[1000px] space-y-6">
          <PageBreadcrumb steps={[{ label: 'Mes documents' }]} />
          <PortalPageHero
            eyebrow="Espace adhérent"
            title="Votre bibliothèque personnelle, toujours à portée de main."
            description="Connectez-vous pour retrouver vos fichiers, vos dossiers et les documents partagés avec les adhérents."
            icon={Lock}
          />
          <section className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-900">Connexion requise</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Pour accéder à vos documents, vous devez être connecté à votre espace adhérent.
            </p>
            <Link to="/profil">
              <Button className="mt-6 bg-red-600 text-white hover:bg-red-700">
                Se connecter <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const publicDocuments = documents.filter((document) => document.is_public).length;
  const privateDocuments = documents.length - publicDocuments;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <PageBreadcrumb steps={[{ label: 'Mes documents' }]} />

        <PortalPageHero
          eyebrow="Espace adhérent"
          title="Votre bibliothèque personnelle, toujours à portée de main."
          description="Classez vos fichiers, gardez-les privés par défaut et choisissez ceux que vous souhaitez partager avec les autres adhérents connectés."
          icon={FolderOpen}
          actions={
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-xl bg-red-600 font-bold text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter un document
            </Button>
          }
          aside={
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Documents</p>
                <p className="mt-1 text-3xl font-black tabular-nums text-teal-300">{documents.length}</p>
                <p className="mt-1 text-xs text-white/60">{folders.length} dossier{folders.length > 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Confidentialité</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-red-300">{privateDocuments}</p>
                <p className="mt-1 text-xs text-white/60">privés · {publicDocuments} publics</p>
              </div>
            </>
          }
        />

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-600">Bibliothèque</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">Dossiers et fichiers</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewFolderOpen(true)}
                className="w-fit rounded-xl border-slate-200 font-semibold"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Nouveau dossier
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFolder(ALL_FOLDERS)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeFolder === ALL_FOLDERS ? "border-red-600 bg-red-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setActiveFolder(ROOT_FOLDER)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeFolder === ROOT_FOLDER ? "border-red-600 bg-red-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                Sans dossier
              </button>
              {folders.map((folder) => (
                <div key={folder.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setActiveFolder(folder.id)}
                    className={`flex items-center gap-1.5 rounded-full border py-1.5 pl-3 pr-6 text-xs font-semibold transition-colors ${activeFolder === folder.id ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <Folder className="h-3 w-3" /> {folder.name}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleDeleteFolder(folder); }}
                    aria-label={`Supprimer le dossier ${folder.name}`}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 ${activeFolder === folder.id ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-red-600"}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="flex justify-center py-14">
                <Loader2 className="h-6 w-6 animate-spin text-red-600" />
              </div>
            ) : visibleDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-16 text-center text-slate-400">
                <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="font-semibold text-slate-600">Aucun document</p>
                <p className="mt-1 text-sm">
                  {activeFolder === ALL_FOLDERS ? 'Cliquez sur « Ajouter un document » pour envoyer votre premier fichier.' : "Aucun document dans ce dossier."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {visibleDocuments.map((doc) => (
                  <article key={doc.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-teal-200 hover:shadow-md hover:shadow-slate-900/[0.04]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-slate-900">{doc.title}</p>
                          {doc.description && <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{doc.description}</p>}
                          <p className="mt-1.5 text-[11px] text-slate-400">
                            {doc.file_name} · {fmtSize(doc.file_size)} · {fmtDate(doc.created_at)}
                            {doc.folder_id && activeFolder === ALL_FOLDERS && (
                              <> · <span className="inline-flex items-center gap-0.5"><Folder className="h-3 w-3" />{folders.find((folder) => folder.id === doc.folder_id)?.name}</span></>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {isPreviewable(doc.file_type) && (
                          <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)} aria-label="Aperçu">
                            <Eye className="h-4 w-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} aria-label="Télécharger">
                          <Download className="h-4 w-4 text-slate-400 hover:text-red-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} aria-label="Supprimer">
                          <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${doc.is_public ? "text-teal-700" : "text-slate-500"}`}>
                        {doc.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {doc.is_public ? "Public — visible par les adhérents connectés" : "Privé — visible par vous seul"}
                      </span>
                      <Switch checked={doc.is_public} onCheckedChange={() => togglePublic(doc)} aria-label="Rendre public" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <AddDocumentDialog
          key={`add-document-${addOpen}-${activeFolder}`}
          open={addOpen}
          onClose={() => setAddOpen(false)}
          userId={user.id}
          folders={folders}
          defaultFolderId={activeFolder === ALL_FOLDERS || activeFolder === ROOT_FOLDER ? null : activeFolder}
          onCreated={fetchDocuments}
        />
        <NewFolderDialog
          open={newFolderOpen}
          onClose={() => setNewFolderOpen(false)}
          userId={user.id}
          onCreated={fetchFolders}
        />
        <PreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      </div>
    </main>
  );
}

function NewFolderDialog({ open, onClose, userId, onCreated }: { open: boolean; onClose: () => void; userId: string; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nom du dossier requis");
    setSaving(true);
    try {
      const { error } = await supabase.from("document_folders").insert({ user_id: userId, name: name.trim() });
      if (error) {
        toast.error(error.code === "23505" ? "Un dossier avec ce nom existe déjà" : `Impossible de créer le dossier : ${getSupabaseErrorMessage(error)}`);
        return;
      }
      toast.success("Dossier créé");
      setName("");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? `Erreur inattendue : ${err.message}` : "Une erreur inattendue est survenue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setName(""); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Folder className="w-5 h-5 text-red-600" />Nouveau dossier</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="folder-name">Nom du dossier</Label>
            <Input id="folder-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Contrats" maxLength={100} required className="mt-1" autoFocus />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setName(""); onClose(); }}>Annuler</Button>
            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création…</> : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type PreviewState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "image"; url: string }
  | { kind: "pdf"; url: string }
  | { kind: "html"; html: string }
  | { kind: "text"; text: string };

function PreviewDialog({ doc, onClose }: { doc: UserDocument | null; onClose: () => void }) {
  const [state, setState] = useState<PreviewState>({ kind: "loading" });

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setState({ kind: "loading" });
    }, 0);

    (async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 300);
      if (error || !data?.signedUrl) {
        if (!cancelled) setState({ kind: "error" });
        return;
      }
      const signedUrl = data.signedUrl;

      try {
        if (IMAGE_TYPES.includes(doc.file_type ?? "")) {
          if (!cancelled) setState({ kind: "image", url: signedUrl });
        } else if (doc.file_type === "application/pdf") {
          if (!cancelled) setState({ kind: "pdf", url: signedUrl });
        } else if (doc.file_type === DOCX_TYPE) {
          const [{ convertToHtml }, res] = await Promise.all([import("mammoth"), fetch(signedUrl)]);
          const arrayBuffer = await res.arrayBuffer();
          const result = await convertToHtml({ arrayBuffer });
          if (!cancelled) setState({ kind: "html", html: DOMPurify.sanitize(result.value) });
        } else if (SHEET_TYPES.includes(doc.file_type ?? "")) {
          const [{ default: ExcelJS }, res] = await Promise.all([import("exceljs"), fetch(signedUrl)]);
          const arrayBuffer = await res.arrayBuffer();
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer);
          const firstSheet = workbook.worksheets[0];
          const escapeCell = (value: unknown) =>
            String(value ?? "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
          const rows = firstSheet
            ? firstSheet.getSheetValues().slice(1).map((row) =>
                (Array.isArray(row) ? row.slice(1) : []).map((cell) => {
                  if (cell && typeof cell === "object" && "text" in cell) {
                    return escapeCell((cell as { text?: unknown }).text);
                  }
                  return escapeCell(cell);
                }),
              )
            : [];
          const html = `<table>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table>`;
          if (!cancelled) setState({ kind: "html", html: DOMPurify.sanitize(html) });
        } else if (doc.file_type === "text/plain") {
          const res = await fetch(signedUrl);
          const text = await res.text();
          if (!cancelled) setState({ kind: "text", text });
        } else if (!cancelled) {
          setState({ kind: "error" });
        }
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [doc]);

  return (
    <Dialog open={!!doc} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle className="truncate pr-6">{doc?.title}</DialogTitle></DialogHeader>
        <div className="min-h-[50vh] max-h-[70vh] bg-slate-50 rounded-lg overflow-auto">
          {state.kind === "loading" ? (
            <div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : state.kind === "error" ? (
            <p className="text-sm text-slate-400 text-center py-24">Aperçu indisponible</p>
          ) : state.kind === "pdf" ? (
            <iframe src={state.url} title={doc?.title} className="w-full h-[70vh]" />
          ) : state.kind === "image" ? (
            <div className="flex items-center justify-center h-[50vh]">
              <img src={state.url} alt={doc?.title} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          ) : state.kind === "text" ? (
            <pre className="whitespace-pre-wrap break-words p-4 text-sm text-slate-700">{state.text}</pre>
          ) : (
            <>
              <style>{`.preview-office-content table { border-collapse: collapse; } .preview-office-content td, .preview-office-content th { border: 1px solid #e2e8f0; padding: 4px 8px; }`}</style>
              <div className="preview-office-content p-4 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: state.html }} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddDocumentDialog({
  open, onClose, userId, folders, defaultFolderId, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  folders: DocumentFolder[];
  defaultFolderId: string | null;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileInputId = `user-document-file-${userId}`;

  const clearFileInput = () => {
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setIsPublic(false);
    setFile(null);
    setFolderId(null);
    setProgress(null);
    clearFileInput();
  };

  const openFilePicker = () => {
    clearFileInput();
    fileRef.current?.click();
  };

  const pickFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      clearFileInput();
      return toast.error(`${selected.name} dépasse 20 Mo`);
    }
    if (!isAllowedFile(selected)) {
      clearFileInput();
      return toast.error(`${selected.name} n'est pas un format autorisé`);
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Titre du document requis");
    if (!file) return toast.error("Fichier requis");
    setSaving(true);
    setProgress(0);

    const sessionId = (crypto.randomUUID?.() ?? String(Date.now()));
    // Journal de diagnostic (fire-and-forget) : l'insert REST fonctionne sur mobile,
    // ce qui nous permet de tracer précisément où l'upload de fichier échoue.
    const logDiag = (step: string, detail?: unknown) => {
      void supabase.from("upload_diagnostics").insert({
        user_id: userId,
        session_id: sessionId,
        step,
        detail: (detail ?? null) as never,
        user_agent: navigator.userAgent,
      }).then(() => {}, () => {});
    };

    const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new DOMException("timeout", "TimeoutError")), ms)),
      ]);

    try {
      const contentType = getFileContentType(file);
      logDiag("submit_start", { name: file.name, size: file.size, type: file.type, contentType });

      // On envoie le fichier via une Edge Function (POST JSON base64) plutôt que par
      // upload multipart direct vers Storage. Sur les navigateurs mobiles concernés,
      // seul le POST multipart de fichier vers Storage échoue ; les POST JSON (REST,
      // Edge, auth) fonctionnent. On passe donc par ce chemin fiable, l'Edge Function
      // écrivant ensuite dans Storage côté serveur.
      let fileBase64: string;
      try {
        const t0 = performance.now();
        fileBase64 = await withTimeout(
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
            reader.readAsDataURL(file);
          }),
          30000,
        );
        logDiag("file_read_ok", { length: fileBase64.length, ms: Math.round(performance.now() - t0) });
      } catch (readErr) {
        logDiag("file_read_failed", { message: readErr instanceof Error ? readErr.message : String(readErr) });
        toast.error("Impossible de lire le fichier sur cet appareil. Essayez un autre fichier ou un autre navigateur.");
        return;
      }

      logDiag("invoke_start");
      setProgress(null);
      const { data, error: fnError } = await withTimeout(
        supabase.functions.invoke("upload-user-document", {
          body: {
            fileBase64,
            fileName: file.name,
            contentType,
            title: title.trim(),
            description: description.trim() || null,
            isPublic,
            folderId,
          },
        }),
        120000,
      );

      const fnErrorMessage = (data && (data as { error?: string }).error) || fnError?.message;
      if (fnError || fnErrorMessage) {
        logDiag("invoke_error", { message: fnErrorMessage ?? "erreur" });
        toast.error(`Échec de l'envoi du fichier : ${fnErrorMessage ?? "erreur inconnue"}`);
        return;
      }
      logDiag("invoke_ok");

      toast.success("Document ajouté");
      reset();
      onCreated();
      onClose();
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        toast.error("L'enregistrement a mis trop de temps à répondre. Réessayez.");
      } else {
        toast.error(err instanceof Error ? `Erreur inattendue : ${err.message}` : "Une erreur inattendue est survenue lors de l'envoi");
      }
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-red-600" />Ajouter un document</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="doc-title">Titre *</Label>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du document" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="doc-desc">Description</Label>
            <Textarea id="doc-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Facultatif" rows={3} className="mt-1 resize-none" />
          </div>
          {folders.length > 0 && (
            <div>
              <Label htmlFor="doc-folder">Dossier</Label>
              <Select value={folderId ?? ROOT_FOLDER} onValueChange={(v) => setFolderId(v === ROOT_FOLDER ? null : v)}>
                <SelectTrigger id="doc-folder" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROOT_FOLDER}>Aucun dossier</SelectItem>
                  {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor={fileInputId}>Fichier *</Label>
            <input
              id={fileInputId}
              ref={fileRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={openFilePicker}
              className="mt-1 w-full cursor-pointer border-2 border-dashed border-slate-200 rounded-lg py-3 px-3 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-700 transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Upload className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{file ? file.name : "Choisir un fichier, 20 Mo max"}</span>
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Rendre public</p>
              <p className="text-xs text-slate-500">Visible par tous les adhérents connectés, sinon réservé à vous seul.</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} aria-label="Rendre public" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>Annuler</Button>
            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progress !== null && progress < 100 ? `Envoi… ${progress}%` : "Envoi…"}</>
                : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
