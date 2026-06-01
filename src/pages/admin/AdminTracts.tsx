import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2, Eye, EyeOff, Upload, Loader2, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import type { Tables } from "@/integrations/supabase/types";

type Tract = Tables<"tracts">;

const themeLabels: Record<string, string> = {
  nao: "NAO",
  elections: "Élections",
  droits: "Droits",
  sante: "Santé & sécurité",
  teletravail: "Télétravail",
  general: "Général",
};

const themeColors: Record<string, string> = {
  nao: "#dc2626",
  elections: "#2563eb",
  droits: "#7c3aed",
  sante: "#16a34a",
  teletravail: "#0891b2",
  general: "#475569",
};

const emptyForm = {
  title: "",
  subtitle: "",
  theme_id: "general",
  published_at: new Date().toISOString().slice(0, 10),
};

export default function AdminTracts() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const { data: tracts = [], isLoading } = useQuery({
    queryKey: ["admin-tracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Tract[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (tract: Tract) => {
      const { error } = await supabase
        .from("tracts")
        .update({ is_published: !tract.is_published })
        .eq("id", tract.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tracts"] }),
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (tract: Tract) => {
      if (tract.file_url) {
        const path = tract.file_url.split("/tracts/")[1];
        if (path) await supabase.storage.from("tracts").remove([path]);
      }
      if (tract.image_url && tract.image_url.includes("/tracts/")) {
        const path = tract.image_url.split("/tracts/")[1];
        if (path) await supabase.storage.from("tracts").remove([path]);
      }
      const { error } = await supabase.from("tracts").delete().eq("id", tract.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracts"] });
      toast.success("Tract supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const uploadFile = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop();
    const path = `${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("tracts").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("tracts").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!pdfFile) { toast.error("Le fichier PDF est requis"); return; }

    setUploading(true);
    try {
      const fileUrl = await uploadFile(pdfFile, "tract");
      const imageUrl = coverFile ? await uploadFile(coverFile, "cover") : null;

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("tracts").insert({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        theme_id: form.theme_id,
        file_url: fileUrl,
        image_url: imageUrl,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
        is_published: true,
        layout_id: "pdf",
        created_by: user?.id,
      });
      if (error) throw error;

      toast.success("Tract publié");
      queryClient.invalidateQueries({ queryKey: ["admin-tracts"] });
      setOpen(false);
      setForm(emptyForm);
      setPdfFile(null);
      setCoverFile(null);
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <AdminAuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tracts syndicaux</h1>
                <p className="text-sm text-slate-500">{tracts.length} tract{tracts.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Nouveau tract
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              ) : tracts.length === 0 ? (
                <div className="text-center py-12">
                  <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Aucun tract pour l'instant</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tracts.map((tract) => (
                    <div key={tract.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{tract.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: themeColors[tract.theme_id] || "#475569", color: "white" }}
                          >
                            {themeLabels[tract.theme_id] || tract.theme_id}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatDate(tract.published_at || tract.created_at)}</span>
                          {tract.file_url && (
                            <a href={tract.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                              Voir PDF
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => toggleMutation.mutate(tract)}
                          title={tract.is_published ? "Masquer" : "Publier"}
                        >
                          {tract.is_published
                            ? <Eye className="w-4 h-4 text-green-500" />
                            : <EyeOff className="w-4 h-4 text-slate-400" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => { if (window.confirm(`Supprimer "${tract.title}" ?`)) deleteMutation.mutate(tract); }}
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog upload */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau tract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titre *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: NAO 2026 — Position FO COM"
                />
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Description courte"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thème</Label>
                  <Select value={form.theme_id} onValueChange={(v) => setForm({ ...form, theme_id: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(themeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date de publication</Label>
                  <Input
                    type="date"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  />
                </div>
              </div>

              {/* PDF */}
              <div>
                <Label>Fichier PDF *</Label>
                <div
                  className="mt-1 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 transition-colors"
                  onClick={() => pdfRef.current?.click()}
                >
                  {pdfFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate">{pdfFile.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}>
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      Cliquer pour choisir un PDF
                    </div>
                  )}
                </div>
                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </div>

              {/* Cover */}
              <div>
                <Label>Image de couverture <span className="text-slate-400">(optionnel)</span></Label>
                <div
                  className="mt-1 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 transition-colors"
                  onClick={() => coverRef.current?.click()}
                >
                  {coverFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate">{coverFile.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setCoverFile(null); }}>
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      JPG, PNG ou WebP
                    </div>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={uploading} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Upload en cours..." : "Publier le tract"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
