import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase, SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

type XhrUploadResult = { error: null } | { error: { message: string; isTimeout?: boolean } };

// Upload direct via XMLHttpRequest plutôt que le fetch multipart de supabase-js.
// Sur certains navigateurs mobiles, l'upload fetch peut rester bloqué sans jamais
// atteindre le serveur (constaté sur plusieurs téléphones/réseaux/navigateurs, alors
// que GET/DELETE passent) ; XHR utilise une pile réseau distincte, bien plus fiable
// pour l'envoi de fichiers sur mobile, et expose une vraie progression.
async function uploadFileViaXHR(
  bucket: string,
  path: string,
  file: File,
  contentType: string,
  onProgress?: (pct: number) => void,
  timeoutMs = 120000,
): Promise<XhrUploadResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const url = `${SUPABASE_PROJECT_URL}/storage/v1/object/${bucket}/${path}`;
  // On garantit le bon type MIME dans la partie multipart : certains fichiers issus
  // de l'appareil photo/galerie Android ont un file.type vide, ce qui ferait rejeter
  // l'upload par la liste allowed_mime_types du bucket.
  const typedFile = file.type === contentType ? file : new File([file], file.name, { type: contentType });
  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", typedFile, file.name);

  return new Promise<XhrUploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.timeout = timeoutMs;
    if (session?.access_token) xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", "false");
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve({ error: null });
      let message = `Envoi refusé (HTTP ${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText);
        message = body.message || body.error || message;
      } catch { /* réponse non JSON */ }
      resolve({ error: { message } });
    };
    xhr.onerror = () => resolve({ error: { message: "Erreur réseau pendant l'envoi" } });
    xhr.ontimeout = () => resolve({ error: { message: "timeout", isTimeout: true } });
    xhr.onabort = () => resolve({ error: { message: "Envoi annulé" } });
    xhr.send(form);
  });
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
    if (!authLoading) { fetchDocuments(); fetchFolders(); }
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
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Connexion requise</h2>
        <p className="text-slate-500 text-sm mb-6">Pour accéder à vos documents, vous devez être connecté à votre espace adhérent.</p>
        <Link to="/profil"><Button className="bg-red-600 hover:bg-red-700 text-white">Se connecter <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-red-600" /> Mes documents
          </h1>
          <p className="text-slate-500 text-sm mt-1">Vos fichiers personnels, privés par défaut. Rendez-en un public pour le partager avec les autres adhérents connectés.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Ajouter un document
        </Button>
      </div>

      {/* Dossiers */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          type="button" onClick={() => setActiveFolder(ALL_FOLDERS)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeFolder === ALL_FOLDERS ? "bg-red-600 border-red-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
        >
          Tous
        </button>
        <button
          type="button" onClick={() => setActiveFolder(ROOT_FOLDER)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeFolder === ROOT_FOLDER ? "bg-red-600 border-red-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
        >
          Sans dossier
        </button>
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              type="button" onClick={() => setActiveFolder(folder.id)}
              className={`text-xs font-medium pl-3 pr-6 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${activeFolder === folder.id ? "bg-red-600 border-red-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              <Folder className="w-3 h-3" /> {folder.name}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
              aria-label={`Supprimer le dossier ${folder.name}`}
              className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${activeFolder === folder.id ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-red-600"}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button" onClick={() => setNewFolderOpen(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-teal-400 hover:text-teal-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Nouveau dossier
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : visibleDocuments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Aucun document</p>
          <p className="text-sm mt-1">
            {activeFolder === ALL_FOLDERS ? 'Cliquez sur "Ajouter un document" pour envoyer votre premier fichier.' : "Aucun document dans ce dossier."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{doc.title}</p>
                    {doc.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{doc.description}</p>}
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {doc.file_name} · {fmtSize(doc.file_size)} · {fmtDate(doc.created_at)}
                      {doc.folder_id && activeFolder === ALL_FOLDERS && (
                        <> · <span className="inline-flex items-center gap-0.5"><Folder className="w-3 h-3" />{folders.find((f) => f.id === doc.folder_id)?.name}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPreviewable(doc.file_type) && (
                    <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)} aria-label="Aperçu"><Eye className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} aria-label="Télécharger"><Download className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} aria-label="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${doc.is_public ? "text-teal-700" : "text-slate-500"}`}>
                  {doc.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {doc.is_public ? "Public — visible par les adhérents connectés" : "Privé — visible par vous seul"}
                </span>
                <Switch checked={doc.is_public} onCheckedChange={() => togglePublic(doc)} aria-label="Rendre public" />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddDocumentDialog
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
    setState({ kind: "loading" });

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
          const [XLSX, res] = await Promise.all([import("xlsx"), fetch(signedUrl)]);
          const arrayBuffer = await res.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const html = XLSX.utils.sheet_to_html(firstSheet);
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

    return () => { cancelled = true; };
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

  useEffect(() => { if (open) setFolderId(defaultFolderId); }, [open, defaultFolderId]);

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

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new DOMException("timeout", "TimeoutError")), ms)),
      ]);

    try {
      const contentType = getFileContentType(file);
      const up = await uploadFileViaXHR(BUCKET, path, file, contentType, setProgress, 120000);
      if (up.error) {
        if (up.error.isTimeout) {
          toast.error("L'envoi a mis trop de temps à répondre (connexion instable ?). Réessayez.");
        } else {
          toast.error(`Échec de l'envoi du fichier : ${up.error.message}`);
        }
        return;
      }

      const { error } = await withTimeout(
        supabase.from("user_documents").insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          file_type: contentType,
          is_public: isPublic,
          folder_id: folderId,
        }),
        15000,
      );

      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        toast.error(`Erreur lors de l'enregistrement : ${getSupabaseErrorMessage(error)}`);
        return;
      }

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
