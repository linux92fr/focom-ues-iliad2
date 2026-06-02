import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Mic, Plus, Pencil, Trash2, Upload, Eye, EyeOff,
  Loader2, Lock, Globe, Clock, FileAudio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Podcast {
  id: string;
  episode_number: number;
  title: string;
  description: string | null;
  transcript: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number | null;
  is_members_only: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const empty = (): Partial<Podcast> => ({
  episode_number: 1,
  title: "",
  description: "",
  transcript: "",
  audio_url: "",
  cover_url: "",
  duration_seconds: null,
  is_members_only: false,
  is_published: false,
});

function formatDuration(s: number | null): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${(m % 60).toString().padStart(2, "0")}`;
  return `${m} min`;
}

export default function AdminPodcasts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Podcast>>(empty());
  const [isNew, setIsNew] = useState(true);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["admin-podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .order("episode_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Podcast[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (ep: Partial<Podcast>) => {
      const payload = {
        episode_number: ep.episode_number,
        title: ep.title,
        description: ep.description || null,
        transcript: ep.transcript || null,
        audio_url: ep.audio_url,
        cover_url: ep.cover_url || null,
        duration_seconds: ep.duration_seconds || null,
        is_members_only: ep.is_members_only ?? false,
        is_published: ep.is_published ?? false,
        published_at: ep.is_published && !ep.published_at ? new Date().toISOString() : ep.published_at,
      };
      if (isNew) {
        const { error } = await supabase.from("podcasts").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("podcasts").update(payload).eq("id", ep.id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-podcasts"] });
      toast({ title: isNew ? "Épisode créé" : "Épisode mis à jour" });
      setModalOpen(false);
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from("podcasts").update({
        is_published: val,
        published_at: val ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcasts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-podcasts"] });
      toast({ title: "Épisode supprimé" });
    },
  });

  const uploadFile = async (
    file: File,
    folder: "audio" | "covers",
    onDone: (url: string) => void,
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("podcasts").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("podcasts").getPublicUrl(path);
      onDone(data.publicUrl);
      toast({ title: "Fichier uploadé" });
    } catch (e: unknown) {
      toast({ title: "Erreur upload", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.episode_number)) + 1 : 1;
    setEditing({ ...empty(), episode_number: nextNum });
    setIsNew(true);
    setModalOpen(true);
  };

  const openEdit = (ep: Podcast) => {
    setEditing({ ...ep });
    setIsNew(false);
    setModalOpen(true);
  };

  return (
    <AdminLayout title="Podcasts" breadcrumb={["Admin", "Podcasts"]}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-red-600" />
          <h1 className="text-xl font-bold text-slate-900">Gestion des podcasts</h1>
          <Badge variant="outline" className="ml-2">{episodes.length} épisode{episodes.length > 1 ? "s" : ""}</Badge>
        </div>
        <Button onClick={openNew} className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Nouvel épisode
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : episodes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Mic className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-600">Aucun épisode pour l'instant</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Créez votre premier épisode de podcast.</p>
          <Button onClick={openNew} className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Créer le premier épisode
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div key={ep.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-4">
              {/* Miniature */}
              <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                {ep.cover_url
                  ? <img src={ep.cover_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-300">#{ep.episode_number}</div>
                }
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">Épisode {ep.episode_number}</span>
                  {ep.is_members_only && (
                    <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Adhérents
                    </Badge>
                  )}
                  <Badge className={`text-[10px] ${ep.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {ep.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="font-semibold text-slate-900 truncate mt-0.5">{ep.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(ep.duration_seconds)}</span>
                  <span className="flex items-center gap-1"><FileAudio className="w-3 h-3" />{ep.audio_url ? "Audio OK" : "Pas d'audio"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish.mutate({ id: ep.id, val: !ep.is_published })}
                  className={`p-2 rounded-lg transition-colors ${ep.is_published ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-50"}`}
                  title={ep.is_published ? "Dépublier" : "Publier"}
                >
                  {ep.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(ep)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Supprimer cet épisode ?")) deleteMutation.mutate(ep.id); }}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal édition */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-red-600" />
              {isNew ? "Nouvel épisode" : `Modifier : ${editing.title}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Numéro + titre */}
            <div className="grid grid-cols-[100px_1fr] gap-3">
              <div className="space-y-1.5">
                <Label>Numéro</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.episode_number ?? ""}
                  onChange={(e) => setEditing({ ...editing, episode_number: parseInt(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Titre <span className="text-red-500">*</span></Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Ex : Les négociations NAO 2026 expliquées"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Résumé de l'épisode affiché sur la page podcast..."
                className="rounded-xl min-h-[80px]"
              />
            </div>

            {/* Fichier audio */}
            <div className="space-y-1.5">
              <Label>Fichier audio (MP3) <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  value={editing.audio_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, audio_url: e.target.value })}
                  placeholder="URL audio ou uploadez ci-contre"
                  className="rounded-xl flex-1"
                />
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "audio", (url) => setEditing((prev) => ({ ...prev, audio_url: url })), setUploadingAudio);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadingAudio}
                  className="rounded-xl shrink-0 gap-2"
                >
                  {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingAudio ? "Upload…" : "Upload"}
                </Button>
              </div>
            </div>

            {/* Durée */}
            <div className="space-y-1.5">
              <Label>Durée (en secondes)</Label>
              <Input
                type="number"
                min={0}
                value={editing.duration_seconds ?? ""}
                onChange={(e) => setEditing({ ...editing, duration_seconds: parseInt(e.target.value) || null })}
                placeholder="Ex : 1800 pour 30 min"
                className="rounded-xl w-48"
              />
            </div>

            {/* Image de couverture */}
            <div className="space-y-1.5">
              <Label>Image de couverture</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={editing.cover_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                  placeholder="URL image ou uploadez"
                  className="rounded-xl flex-1"
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "covers", (url) => setEditing((prev) => ({ ...prev, cover_url: url })), setUploadingCover);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="rounded-xl shrink-0 gap-2"
                >
                  {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
                {editing.cover_url && (
                  <img src={editing.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                )}
              </div>
            </div>

            {/* Transcription */}
            <div className="space-y-1.5">
              <Label>Transcription / Résumé détaillé</Label>
              <Textarea
                value={editing.transcript ?? ""}
                onChange={(e) => setEditing({ ...editing, transcript: e.target.value })}
                placeholder="Transcription complète ou résumé détaillé de l'épisode..."
                className="rounded-xl min-h-[120px]"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 border border-slate-100 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between flex-1 gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Réservé aux adhérents</p>
                    <p className="text-xs text-slate-500">Masqué pour les non-membres</p>
                  </div>
                </div>
                <Switch
                  checked={editing.is_members_only ?? false}
                  onCheckedChange={(v) => setEditing({ ...editing, is_members_only: v })}
                />
              </div>
              <div className="flex items-center justify-between flex-1 gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Publié</p>
                    <p className="text-xs text-slate-500">Visible sur le site</p>
                  </div>
                </div>
                <Switch
                  checked={editing.is_published ?? false}
                  onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">
                Annuler
              </Button>
              <Button
                onClick={() => saveMutation.mutate(editing)}
                disabled={!editing.title || !editing.audio_url || saveMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isNew ? "Créer l'épisode" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
