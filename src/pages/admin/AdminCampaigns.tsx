import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarDays, Check, ExternalLink, Eye, Image as ImageIcon,
  Loader2, Megaphone, Pencil, Plus, RefreshCw, Save, ShieldCheck,
  ToggleLeft, Trash2, X,
} from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type BannerType = "urgent" | "info" | "event" | "announcement";
type FlashBanner = {
  id: string; message: string; type: BannerType; link: string | null;
  start_date: string; end_date: string; is_active: boolean | null;
  created_at: string | null;
};
type Popup = {
  id: string; title: string; content: string; button_text: string | null;
  button_url: string | null; is_active: boolean; show_to_authenticated: boolean;
  show_to_anonymous: boolean; start_date: string | null; end_date: string | null;
  display_frequency: string | null; position: string | null; image_url: string | null;
  created_at: string;
};
type BannerDraft = {
  message: string; type: BannerType; link: string; start_date: string;
  end_date: string; is_active: boolean;
};
type PopupDraft = {
  title: string; content: string; button_text: string; button_url: string;
  image_url: string; start_date: string; end_date: string; is_active: boolean;
  show_to_authenticated: boolean; show_to_anonymous: boolean;
  display_frequency: string; position: string;
};

const nowLocal = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const dateToInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const dateToIso = (value: string) => value ? new Date(value).toISOString() : null;
const emptyBanner = (): BannerDraft => ({
  message: "", type: "info", link: "", start_date: nowLocal(),
  end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16), is_active: true,
});
const emptyPopup = (): PopupDraft => ({
  title: "", content: "", button_text: "En savoir plus", button_url: "",
  image_url: "", start_date: "", end_date: "", is_active: true,
  show_to_authenticated: true, show_to_anonymous: true,
  display_frequency: "once", position: "center",
});
const isInWindow = (start?: string | null, end?: string | null) => {
  const now = Date.now();
  return (!start || new Date(start).getTime() <= now) && (!end || new Date(end).getTime() >= now);
};
const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

function StatusPill({ active, start, end }: { active: boolean; start?: string | null; end?: string | null }) {
  if (!active) return <Badge variant="secondary">Désactivé</Badge>;
  if (!isInWindow(start, end)) return <Badge variant="outline">Programmé / expiré</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">En ligne</Badge>;
}

function AdminCampaignsContent() {
  const { user } = useAdminAuth();
  const [tab, setTab] = useState<"banners" | "popups">("banners");
  const [banners, setBanners] = useState<FlashBanner[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerDraft, setBannerDraft] = useState<BannerDraft>(emptyBanner);
  const [popupDraft, setPopupDraft] = useState<PopupDraft>(emptyPopup);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [editingPopup, setEditingPopup] = useState<string | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [preview, setPreview] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [bannerResult, popupResult] = await Promise.all([
      supabase.from("flash_banners").select("*").order("created_at", { ascending: false }),
      supabase.from("popups").select("*").order("created_at", { ascending: false }),
    ]);
    if (bannerResult.error) toast.error("Chargement des bandeaux impossible : " + bannerResult.error.message);
    else setBanners((bannerResult.data ?? []) as FlashBanner[]);
    if (popupResult.error) toast.error("Chargement des popups impossible : " + popupResult.error.message);
    else setPopups((popupResult.data ?? []) as Popup[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
    const channel = supabase
      .channel("admin-campaigns-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "flash_banners" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "popups" }, () => void loadData())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadData]);

  const activeBannerCount = useMemo(
    () => banners.filter((item) => item.is_active && isInWindow(item.start_date, item.end_date)).length,
    [banners],
  );
  const activePopupCount = useMemo(
    () => popups.filter((item) => item.is_active && isInWindow(item.start_date, item.end_date)).length,
    [popups],
  );

  const startEditBanner = (item: FlashBanner) => {
    setEditingBanner(item.id);
    setBannerDraft({
      message: item.message, type: item.type, link: item.link ?? "",
      start_date: dateToInput(item.start_date), end_date: dateToInput(item.end_date),
      is_active: item.is_active !== false,
    });
    setShowBannerForm(true);
    setPreview(false);
  };
  const startEditPopup = (item: Popup) => {
    setEditingPopup(item.id);
    setPopupDraft({
      title: item.title, content: item.content, button_text: item.button_text ?? "",
      button_url: item.button_url ?? "", image_url: item.image_url ?? "",
      start_date: dateToInput(item.start_date), end_date: dateToInput(item.end_date),
      is_active: item.is_active, show_to_authenticated: item.show_to_authenticated,
      show_to_anonymous: item.show_to_anonymous, display_frequency: item.display_frequency ?? "once",
      position: item.position ?? "center",
    });
    setShowPopupForm(true);
    setPreview(false);
  };
  const resetBanner = () => { setEditingBanner(null); setBannerDraft(emptyBanner()); setShowBannerForm(false); setPreview(false); };
  const resetPopup = () => { setEditingPopup(null); setPopupDraft(emptyPopup()); setShowPopupForm(false); setPreview(false); };

  const saveBanner = async () => {
    if (!bannerDraft.message.trim()) return toast.error("Le message du bandeau est obligatoire.");
    if (!bannerDraft.start_date || !bannerDraft.end_date) return toast.error("Les dates de début et de fin sont obligatoires.");
    if (new Date(bannerDraft.end_date) <= new Date(bannerDraft.start_date)) return toast.error("La fin doit être postérieure au début.");
    setSaving(true);
    const payload = {
      message: bannerDraft.message.trim(), type: bannerDraft.type, link: bannerDraft.link.trim() || null,
      start_date: dateToIso(bannerDraft.start_date)!, end_date: dateToIso(bannerDraft.end_date)!,
      is_active: bannerDraft.is_active, ...(user?.supabaseUser.id ? { created_by: user.supabaseUser.id } : {}),
    };
    const result = editingBanner
      ? await supabase.from("flash_banners").update(payload).eq("id", editingBanner)
      : await supabase.from("flash_banners").insert(payload);
    setSaving(false);
    if (result.error) return toast.error("Enregistrement impossible : " + result.error.message);
    toast.success(editingBanner ? "Bandeau mis à jour." : "Bandeau créé.");
    resetBanner();
    await loadData();
  };

  const savePopup = async () => {
    if (!popupDraft.title.trim() || !popupDraft.content.trim()) return toast.error("Le titre et le contenu sont obligatoires.");
    if (!popupDraft.show_to_authenticated && !popupDraft.show_to_anonymous) return toast.error("Choisissez au moins un public.");
    if (popupDraft.start_date && popupDraft.end_date && new Date(popupDraft.end_date) <= new Date(popupDraft.start_date)) return toast.error("La fin doit être postérieure au début.");
    setSaving(true);
    const payload = {
      title: popupDraft.title.trim(), content: popupDraft.content.trim(),
      button_text: popupDraft.button_text.trim() || null, button_url: popupDraft.button_url.trim() || null,
      image_url: popupDraft.image_url.trim() || null,
      start_date: dateToIso(popupDraft.start_date), end_date: dateToIso(popupDraft.end_date),
      is_active: popupDraft.is_active, show_to_authenticated: popupDraft.show_to_authenticated,
      show_to_anonymous: popupDraft.show_to_anonymous, display_frequency: popupDraft.display_frequency,
      position: popupDraft.position, ...(user?.supabaseUser.id ? { created_by: user.supabaseUser.id } : {}),
    };
    const result = editingPopup
      ? await supabase.from("popups").update(payload).eq("id", editingPopup)
      : await supabase.from("popups").insert(payload);
    setSaving(false);
    if (result.error) return toast.error("Enregistrement impossible : " + result.error.message);
    toast.success(editingPopup ? "Popup mise à jour." : "Popup créée.");
    resetPopup();
    await loadData();
  };

  const toggleBanner = async (item: FlashBanner) => {
    const { error } = await supabase.from("flash_banners").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) toast.error(error.message); else { toast.success(item.is_active ? "Bandeau désactivé." : "Bandeau activé."); await loadData(); }
  };
  const togglePopup = async (item: Popup) => {
    const { error } = await supabase.from("popups").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) toast.error(error.message); else { toast.success(item.is_active ? "Popup désactivée." : "Popup activée."); await loadData(); }
  };
  const deleteBanner = async (item: FlashBanner) => {
    if (!window.confirm("Supprimer définitivement ce bandeau ?")) return;
    const { error } = await supabase.from("flash_banners").delete().eq("id", item.id);
    if (error) toast.error(error.message); else { toast.success("Bandeau supprimé."); await loadData(); }
  };
  const deletePopup = async (item: Popup) => {
    if (!window.confirm("Supprimer définitivement cette popup ?")) return;
    const { error } = await supabase.from("popups").delete().eq("id", item.id);
    if (error) toast.error(error.message); else { toast.success("Popup supprimée."); await loadData(); }
  };

  if (user?.role !== "admin") {
    return <AdminAuthGuard><AdminLayout title="Campagnes & popups" breadcrumb={["Administration", "Campagnes & popups"]}>
      <Card className="mx-auto mt-12 max-w-xl"><CardContent className="p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-red-600" />
        <h2 className="text-lg font-bold text-slate-900">Accès réservé aux administrateurs</h2>
        <p className="mt-2 text-sm text-slate-500">La gestion des campagnes et des fenêtres popup est réservée au rôle administrateur.</p>
      </CardContent></Card>
    </AdminLayout></AdminAuthGuard>;
  }

  return (
    <AdminAuthGuard>
      <AdminLayout title="Campagnes & popups" breadcrumb={["Administration", "Communication", "Campagnes & popups"]}>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-red-600" /><h2 className="text-xl font-bold text-slate-900">Centre de communication</h2></div>
              <p className="mt-1 text-sm text-slate-500">Un seul endroit pour programmer les bandeaux du site et les fenêtres popup.</p>
            </div>
            <Button variant="outline" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Actualiser</Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bandeaux actifs</p><p className="mt-1 text-3xl font-black text-slate-900">{activeBannerCount}</p><p className="text-xs text-slate-500">sur {banners.length} au total</p></div><div className="rounded-xl bg-red-50 p-3 text-red-600"><Megaphone className="h-6 w-6" /></div></CardContent></Card>
            <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Popups actives</p><p className="mt-1 text-3xl font-black text-slate-900">{activePopupCount}</p><p className="text-xs text-slate-500">sur {popups.length} au total</p></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Eye className="h-6 w-6" /></div></CardContent></Card>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            <button onClick={() => setTab("banners")} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${tab === "banners" ? "border-b-2 border-red-600 bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-100"}`}>Bandeaux ({banners.length})</button>
            <button onClick={() => setTab("popups")} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${tab === "popups" ? "border-b-2 border-red-600 bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-100"}`}>Popups ({popups.length})</button>
          </div>

          {tab === "banners" && (
            <div className="space-y-4">
              <div className="flex justify-end"><Button onClick={() => { resetBanner(); setShowBannerForm(true); }}><Plus className="mr-2 h-4 w-4" />Nouveau bandeau</Button></div>
              {showBannerForm && (
                <Card className="border-red-200 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>{editingBanner ? "Modifier le bandeau" : "Créer un bandeau"}</span><Button variant="ghost" size="icon" onClick={resetBanner}><X className="h-4 w-4" /></Button></CardTitle></CardHeader>
                  <CardContent className="grid gap-5 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div><Label className={labelClass}>Message *</Label><Textarea value={bannerDraft.message} onChange={(e) => setBannerDraft((d) => ({ ...d, message: e.target.value }))} rows={3} placeholder="Ex. Mobilisation le 5 novembre : informez-vous sur vos droits." /></div>
                      <div><Label className={labelClass}>Type de bandeau</Label><select className={fieldClass} value={bannerDraft.type} onChange={(e) => setBannerDraft((d) => ({ ...d, type: e.target.value as BannerType }))}><option value="urgent">Urgent – rouge</option><option value="info">Information – bleu</option><option value="event">Événement – violet</option><option value="announcement">Annonce – turquoise</option></select></div>
                      <div><Label className={labelClass}>Lien (facultatif)</Label><Input value={bannerDraft.link} onChange={(e) => setBannerDraft((d) => ({ ...d, link: e.target.value }))} placeholder="https://greve.focomues-iliad.fr/" /></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div><Label className={labelClass}>Début d'affichage *</Label><Input type="datetime-local" value={bannerDraft.start_date} onChange={(e) => setBannerDraft((d) => ({ ...d, start_date: e.target.value }))} /></div>
                        <div><Label className={labelClass}>Fin d'affichage *</Label><Input type="datetime-local" value={bannerDraft.end_date} onChange={(e) => setBannerDraft((d) => ({ ...d, end_date: e.target.value }))} /></div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={bannerDraft.is_active} onChange={(e) => setBannerDraft((d) => ({ ...d, is_active: e.target.checked }))} className="h-4 w-4 accent-red-600" />Activer ce bandeau</label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><Label className={labelClass}>Aperçu du bandeau</Label><Button size="sm" variant="ghost" onClick={() => setPreview((v) => !v)}><Eye className="mr-1 h-4 w-4" />{preview ? "Masquer" : "Prévisualiser"}</Button></div>
                      <div className={`rounded-xl p-5 text-center text-sm font-bold text-white shadow-sm ${bannerDraft.type === "urgent" ? "bg-red-700" : bannerDraft.type === "event" ? "bg-violet-700" : bannerDraft.type === "announcement" ? "bg-teal-700" : "bg-sky-700"}`}>{bannerDraft.message || "Votre message apparaîtra ici"}</div>
                      <p className="text-xs text-slate-500">Le bandeau sera visible sur le site et pourra être synchronisé avec l'application Android via la même table Supabase.</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 lg:col-span-2"><Button variant="outline" onClick={resetBanner}>Annuler</Button><Button onClick={() => void saveBanner()} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{editingBanner ? "Enregistrer" : "Créer le bandeau"}</Button></div>
                  </CardContent>
                </Card>
              )}
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div> : banners.length === 0 ? <Card><CardContent className="p-10 text-center"><Megaphone className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="font-semibold text-slate-700">Aucun bandeau enregistré</p><p className="mt-1 text-sm text-slate-500">Créez un bandeau pour communiquer sur le site et dans l'application.</p></CardContent></Card> : (
                <div className="space-y-3">{banners.map((item) => (
                  <Card key={item.id}><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className={`h-12 w-2 shrink-0 rounded-full ${item.type === "urgent" ? "bg-red-600" : item.type === "event" ? "bg-violet-600" : item.type === "announcement" ? "bg-teal-600" : "bg-sky-600"}`} />
                    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><StatusPill active={item.is_active !== false} start={item.start_date} end={item.end_date} /><span className="text-xs text-slate-400">{item.type}</span></div><p className="font-semibold text-slate-900">{item.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.start_date).toLocaleString("fr-FR")} → {new Date(item.end_date).toLocaleString("fr-FR")}</p>{item.link && <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"><ExternalLink className="h-3 w-3" />{item.link}</a>}</div>
                    <div className="flex items-center gap-1 self-end md:self-center"><Button size="sm" variant="outline" onClick={() => void toggleBanner(item)}>{item.is_active ? "Désactiver" : "Activer"}</Button><Button size="icon" variant="ghost" onClick={() => startEditBanner(item)} aria-label="Modifier"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void deleteBanner(item)} aria-label="Supprimer"><Trash2 className="h-4 w-4 text-red-600" /></Button></div>
                  </CardContent></Card>
                ))}</div>
              )}
            </div>
          )}

          {tab === "popups" && (
            <div className="space-y-4">
              <div className="flex justify-end"><Button onClick={() => { resetPopup(); setShowPopupForm(true); }}><Plus className="mr-2 h-4 w-4" />Nouvelle popup</Button></div>
              {showPopupForm && (
                <Card className="border-teal-200 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>{editingPopup ? "Modifier la popup" : "Créer une popup"}</span><Button variant="ghost" size="icon" onClick={resetPopup}><X className="h-4 w-4" /></Button></CardTitle></CardHeader>
                  <CardContent className="grid gap-5 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div><Label className={labelClass}>Titre *</Label><Input value={popupDraft.title} onChange={(e) => setPopupDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Titre de la campagne" /></div>
                      <div><Label className={labelClass}>Contenu *</Label><Textarea rows={5} value={popupDraft.content} onChange={(e) => setPopupDraft((d) => ({ ...d, content: e.target.value }))} placeholder="Message affiché dans la fenêtre popup…" /></div>
                      <div><Label className={labelClass}>URL de l'image (facultatif)</Label><Input value={popupDraft.image_url} onChange={(e) => setPopupDraft((d) => ({ ...d, image_url: e.target.value }))} placeholder="https://…" /></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><Label className={labelClass}>Texte du bouton</Label><Input value={popupDraft.button_text} onChange={(e) => setPopupDraft((d) => ({ ...d, button_text: e.target.value }))} placeholder="En savoir plus" /></div><div><Label className={labelClass}>Lien du bouton</Label><Input value={popupDraft.button_url} onChange={(e) => setPopupDraft((d) => ({ ...d, button_url: e.target.value }))} placeholder="https://…" /></div></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><Label className={labelClass}>Début (facultatif)</Label><Input type="datetime-local" value={popupDraft.start_date} onChange={(e) => setPopupDraft((d) => ({ ...d, start_date: e.target.value }))} /></div><div><Label className={labelClass}>Fin (facultatif)</Label><Input type="datetime-local" value={popupDraft.end_date} onChange={(e) => setPopupDraft((d) => ({ ...d, end_date: e.target.value }))} /></div></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><Label className={labelClass}>Fréquence d'affichage</Label><select className={fieldClass} value={popupDraft.display_frequency} onChange={(e) => setPopupDraft((d) => ({ ...d, display_frequency: e.target.value }))}><option value="once">Une seule fois</option><option value="session">À chaque session</option><option value="always">À chaque visite</option></select></div><div><Label className={labelClass}>Position</Label><select className={fieldClass} value={popupDraft.position} onChange={(e) => setPopupDraft((d) => ({ ...d, position: e.target.value }))}><option value="center">Centrée</option><option value="top">En haut</option><option value="bottom">En bas</option></select></div></div>
                      <div className="space-y-2 rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Public concerné</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={popupDraft.show_to_anonymous} onChange={(e) => setPopupDraft((d) => ({ ...d, show_to_anonymous: e.target.checked }))} className="h-4 w-4 accent-red-600" />Visiteurs non connectés</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={popupDraft.show_to_authenticated} onChange={(e) => setPopupDraft((d) => ({ ...d, show_to_authenticated: e.target.checked }))} className="h-4 w-4 accent-red-600" />Utilisateurs connectés</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={popupDraft.is_active} onChange={(e) => setPopupDraft((d) => ({ ...d, is_active: e.target.checked }))} className="h-4 w-4 accent-red-600" />Activer cette popup</label></div>
                    </div>
                    <div className="space-y-3"><div className="flex items-center justify-between"><Label className={labelClass}>Aperçu</Label><Button size="sm" variant="ghost" onClick={() => setPreview((v) => !v)}><Eye className="mr-1 h-4 w-4" />{preview ? "Masquer" : "Prévisualiser"}</Button></div><div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"><div className="h-2 bg-gradient-to-r from-red-600 to-teal-500" />{popupDraft.image_url && <img src={popupDraft.image_url} alt="" className="max-h-40 w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}<div className="space-y-3 p-5"><p className="text-lg font-black text-slate-900">{popupDraft.title || "Titre de la campagne"}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{popupDraft.content || "Le contenu de votre popup apparaîtra ici."}</p>{popupDraft.button_text && <span className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">{popupDraft.button_text}</span>}</div></div><p className="text-xs text-slate-500">La popup sera programmée selon les dates et la fréquence choisies. L'affichage sur le site et l'application sera raccordé aux mêmes données.</p></div>
                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 lg:col-span-2"><Button variant="outline" onClick={resetPopup}>Annuler</Button><Button onClick={() => void savePopup()} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{editingPopup ? "Enregistrer" : "Créer la popup"}</Button></div>
                  </CardContent>
                </Card>
              )}
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div> : popups.length === 0 ? <Card><CardContent className="p-10 text-center"><Eye className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="font-semibold text-slate-700">Aucune popup enregistrée</p><p className="mt-1 text-sm text-slate-500">Créez une popup pour annoncer une campagne ou une information importante.</p></CardContent></Card> : (
                <div className="space-y-3">{popups.map((item) => (
                  <Card key={item.id}><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="h-12 w-2 shrink-0 rounded-full bg-teal-600" />
                    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><StatusPill active={item.is_active} start={item.start_date} end={item.end_date} /><span className="text-xs text-slate-400">{item.display_frequency ?? "once"} · {item.position ?? "center"}</span></div><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.content}</p><p className="mt-1 text-xs text-slate-500">{item.start_date ? new Date(item.start_date).toLocaleString("fr-FR") : "Dès maintenant"} → {item.end_date ? new Date(item.end_date).toLocaleString("fr-FR") : "Sans date de fin"}</p></div>
                    <div className="flex items-center gap-1 self-end md:self-center"><Button size="sm" variant="outline" onClick={() => void togglePopup(item)}>{item.is_active ? "Désactiver" : "Activer"}</Button><Button size="icon" variant="ghost" onClick={() => startEditPopup(item)} aria-label="Modifier"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void deletePopup(item)} aria-label="Supprimer"><Trash2 className="h-4 w-4 text-red-600" /></Button></div>
                  </CardContent></Card>
                ))}</div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>À savoir :</strong> les bandeaux sont déjà consommés par le site. La gestion des popups est maintenant centralisée dans cette interface, mais leur affichage public doit encore être raccordé à la table <code>popups</code> pour remplacer les fenêtres codées en dur. L'application Android pourra ensuite lire ces mêmes campagnes.</p></div></div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}

export default function AdminCampaigns() {
  return <AdminCampaignsContent />;
}
