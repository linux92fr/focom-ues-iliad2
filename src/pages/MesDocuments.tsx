import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, FileText, Download, Trash2, Loader2, Lock, Globe, FolderOpen,
  ChevronRight, Upload,
} from "lucide-react";

interface UserDocument {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_public: boolean;
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

export default function MesDocuments() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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

  useEffect(() => { if (!authLoading) fetchDocuments(); }, [authLoading, fetchDocuments]);

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

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Aucun document</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter un document" pour envoyer votre premier fichier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{doc.title}</p>
                    {doc.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{doc.description}</p>}
                    <p className="text-[11px] text-slate-400 mt-1.5">{doc.file_name} · {fmtSize(doc.file_size)} · {fmtDate(doc.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
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

      <AddDocumentDialog open={addOpen} onClose={() => setAddOpen(false)} userId={user.id} onCreated={fetchDocuments} />
    </div>
  );
}

function AddDocumentDialog({ open, onClose, userId, onCreated }: { open: boolean; onClose: () => void; userId: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setTitle(""); setDescription(""); setIsPublic(false); setFile(null); };

  const pickFile = (selected: File | null) => {
    if (!selected) return setFile(null);
    if (selected.size > MAX_FILE_SIZE) return toast.error(`${selected.name} dépasse 20 Mo`);
    if (selected.type && !ALLOWED_TYPES.includes(selected.type)) return toast.error(`${selected.name} n'est pas un format autorisé`);
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Titre du document requis");
    if (!file) return toast.error("Fichier requis");
    setSaving(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (upErr) {
      toast.error(`Échec de l'envoi du fichier : ${upErr.message}`);
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_documents").insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      file_type: file.type || null,
      is_public: isPublic,
    });

    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      toast.error(`Erreur lors de l'enregistrement : ${getSupabaseErrorMessage(error)}`);
      setSaving(false);
      return;
    }

    toast.success("Document ajouté");
    reset();
    onCreated();
    onClose();
    setSaving(false);
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
          <div>
            <Label>Fichier *</Label>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-700 transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> {file ? file.name : "Choisir un fichier, 20 Mo max"}
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
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi…</> : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
