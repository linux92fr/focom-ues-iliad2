import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User, Mail, Phone, Loader2, Save, Lock, Eye, EyeOff,
  ShieldCheck, Camera, X, CreditCard, History, CalendarDays,
  Calendar, Clock, MapPin, Video, MessageSquare, AlertCircle,
  CheckCircle2, XCircle, HelpCircle, ChevronRight,
} from "lucide-react";
import CarteAdherent from "@/components/CarteAdherent";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: string | null;
  avatar_url: string | null;
  access_key: string | null;
  created_at: string;
}

interface Adhesion {
  id: string;
  type_adhesion: string;
  date_debut: string;
  date_fin: string;
  montant: number | null;
  status: string;
  commentaires: string | null;
  created_at: string;
}

interface RdvWithPermanence {
  id: string;
  permanence_id: string;
  statut: string;
  sujet: string;
  message: string | null;
  note_delegue: string | null;
  created_at: string;
  permanence: {
    titre: string;
    type: string;
    delegue_nom: string;
    date_permanence: string;
    heure_debut: string;
    heure_fin: string;
    lieu: string | null;
    visio_lien: string | null;
  };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const adhesionStatusLabel: Record<string, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
  expiree: "Expirée",
};

const adhesionStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  en_attente: "secondary",
  validee: "default",
  refusee: "destructive",
  expiree: "outline",
};

const rdvStatusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  en_attente: { label: "En attente", icon: HelpCircle, className: "text-amber-600 bg-amber-50 border-amber-200" },
  confirme:   { label: "Confirmé",   icon: CheckCircle2, className: "text-green-600 bg-green-50 border-green-200" },
  annule:     { label: "Annulé",     icon: XCircle,     className: "text-slate-500 bg-slate-50 border-slate-200" },
  effectue:   { label: "Effectué",   icon: CheckCircle2, className: "text-blue-600 bg-blue-50 border-blue-200" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const formatTime = (t: string) => t.slice(0, 5);

const isUpcoming = (rdv: RdvWithPermanence) =>
  new Date(rdv.permanence.date_permanence) >= new Date(new Date().toDateString()) &&
  rdv.statut !== "annule";

// ─── Composant ────────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "" });

  const [pwData, setPwData] = useState({ next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ next: false, confirm: false });

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData as ProfileData);
          setFormData({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            phone: profileData.phone || "",
          });
          setAvatarPreview(profileData.avatar_url || null);

          const { data: adhesionsData } = await supabase
            .from("adhesions")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false });

          if (adhesionsData) setAdhesions(adhesionsData as Adhesion[]);
        }
      } catch { /* profil inexistant */ }
      finally { setLoading(false); }
    };
    if (user) fetchData();
  }, [user]);

  // ─── RDV (permanences) ───────────────────────────────────────────────────

  const { data: mesRdv = [], isLoading: rdvLoading } = useQuery({
    queryKey: ["profil-mes-rdv", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permanence_rdv")
        .select(`
          id, permanence_id, statut, sujet, message, note_delegue, created_at,
          permanence:permanences (
            titre, type, delegue_nom, date_permanence,
            heure_debut, heure_fin, lieu, visio_lien
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RdvWithPermanence[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (rdvId: string) => {
      const { error } = await supabase
        .from("permanence_rdv")
        .update({ statut: "annule" })
        .eq("id", rdvId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profil-mes-rdv"] });
      toast.success("Rendez-vous annulé");
    },
    onError: () => toast.error("Impossible d'annuler le rendez-vous"),
  });

  const upcomingRdv = mesRdv.filter(isUpcoming);
  const pastRdv = mesRdv.filter((r) => !isUpcoming(r));

  // ─── Avatar ──────────────────────────────────────────────────────────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Format accepté : JPG, PNG ou WebP"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("email", user.email!);
      setAvatarPreview(publicUrl);
      toast.success("Photo de profil mise à jour");
    } catch {
      toast.error("Impossible d'uploader la photo");
      setAvatarPreview(profile?.avatar_url || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ avatar_url: null }).eq("email", user.email!);
    setAvatarPreview(null);
    toast.success("Photo supprimée");
  };

  // ─── Profil ──────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);
    try {
      if (profile) {
        await supabase
  .from("profiles")
  .update({
    first_name: formData.first_name.trim() || "",
    last_name: formData.last_name.trim() || "",
    phone: formData.phone.trim() || null,
  })
  .eq("id", profile.id);
      } else {
        await supabase.from("profiles").insert({
          email: user.email,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          phone: formData.phone || null,
        });
      }
      toast.success("Profil mis à jour avec succès");
    } catch {
      toast.error("Impossible de mettre à jour votre profil");
    } finally {
      setSaving(false);
    }
  };

  // ─── Mot de passe ────────────────────────────────────────────────────────

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pwData.next || pwData.next.length < 8)
      errors.next = "Le mot de passe doit contenir au moins 8 caractères";
    else if (!/[A-Z]/.test(pwData.next))
      errors.next = "Le mot de passe doit contenir au moins une majuscule";
    if (pwData.next !== pwData.confirm)
      errors.confirm = "Les mots de passe ne correspondent pas";
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }

    setPwErrors({});
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwData.next });
      if (error) throw error;
      toast.success("Mot de passe modifié avec succès");
      setPwData({ next: "", confirm: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Impossible de modifier le mot de passe");
    } finally {
      setPwSaving(false);
    }
  };

  const togglePw = (field: keyof typeof showPw) =>
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }));

  // ─── Rendu ────────────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const displayName = formData.first_name || formData.last_name
    ? `${formData.first_name} ${formData.last_name}`.trim()
    : user.email;

  const initials = ((formData.first_name?.charAt(0) || "") + (formData.last_name?.charAt(0) || ""))
    .toUpperCase() || user.email?.substring(0, 2).toUpperCase() || "U";

  const activeAdhesion = adhesions.find((a) => a.status === "validee");
  const nextRdv = upcomingRdv[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-muted/30 py-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mon Espace Adhérent</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos informations et consultez votre adhésion FOCOM UES Iliad
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">

            {/* ── Carte résumé latérale ──────────────────────────────────── */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader className="text-center pb-3">
                <div className="relative w-20 h-20 mx-auto mb-3 group">
                  {avatarPreview ? (
                    <img loading="lazy" src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold ring-4 ring-primary/20">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Changer la photo de profil"
                  >
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                  </button>
                  {avatarPreview && !uploadingAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                      aria-label="Supprimer la photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Sélectionner une photo de profil"
                />
                <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP · 2 Mo max</p>
                <CardTitle className="text-base">{displayName}</CardTitle>
                <CardDescription className="text-xs">{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Separator />

                {/* Statut membre */}
                {profile?.status && (
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Statut</span>
                    <Badge
                      variant={profile.status === "actif" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {profile.status}
                    </Badge>
                  </div>
                )}

                {/* Membre depuis */}
                {profile?.created_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Adhésion active */}
                {activeAdhesion && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Adhésion active
                      </div>
                      <p className="text-[10px] text-green-600">
                        Jusqu'au {new Date(activeAdhesion.date_fin).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </>
                )}

                {/* Prochain RDV */}
                {nextRdv && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                        <Calendar className="w-3.5 h-3.5" />
                        Prochain RDV
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium">
                        {new Date(nextRdv.permanence.date_permanence).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" · "}{formatTime(nextRdv.permanence.heure_debut)}
                      </p>
                      <p className="text-[10px] text-blue-500 truncate">{nextRdv.permanence.delegue_nom}</p>
                    </div>
                  </>
                )}

                <Separator />
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" asChild>
                  <Link to="/permanences">
                    <Calendar className="w-3.5 h-3.5" />
                    Prendre RDV
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* ── Onglets principaux ─────────────────────────────────────── */}
            <div className="md:col-span-3">
              <Tabs defaultValue="infos" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 overflow-hidden">
                  <TabsTrigger value="infos" className="gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Profil</span>
                  </TabsTrigger>
                  <TabsTrigger value="rdv" className="gap-1.5 text-xs relative">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mes RDV</span>
                    {upcomingRdv.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {upcomingRdv.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="carte" className="gap-1.5 text-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ma carte</span>
                  </TabsTrigger>
                  <TabsTrigger value="adhesions" className="gap-1.5 text-xs">
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Adhésions</span>
                  </TabsTrigger>
                  <TabsTrigger value="securite" className="gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sécurité</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Onglet Profil ──────────────────────────────────────── */}
                <TabsContent value="infos">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" /> Informations personnelles
                      </CardTitle>
                      <CardDescription>Modifiez vos informations de contact</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">Prénom</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="first_name" name="first_name"
                                value={formData.first_name} onChange={handleInputChange}
                                placeholder="Votre prénom" maxLength={100} className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Nom</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="last_name" name="last_name"
                                value={formData.last_name} onChange={handleInputChange}
                                placeholder="Votre nom" maxLength={100} className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="email" value={user.email || ""} className="pl-10 bg-muted" disabled />
                            </div>
                            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone" name="phone"
                                value={formData.phone} onChange={handleInputChange}
                                placeholder="06 12 34 56 78" maxLength={20} className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-stretch sm:justify-end">
                          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                            {saving
                              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                              : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Onglet Mes RDV ─────────────────────────────────────── */}
                <TabsContent value="rdv">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Mes rendez-vous
                      </CardTitle>
                      <CardDescription>
                        Permanences réservées avec les délégués FOCOM
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rdvLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : mesRdv.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Aucun rendez-vous enregistré</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/permanences">
                              <ChevronRight className="w-3.5 h-3.5 mr-1" />
                              Prendre un rendez-vous
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">

                          {/* RDV à venir */}
                          {upcomingRdv.length > 0 && (
                            <section>
                              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                À venir ({upcomingRdv.length})
                              </h3>
                              <div className="space-y-3">
                                {upcomingRdv.map((rdv) => (
                                  <RdvCard
                                    key={rdv.id}
                                    rdv={rdv}
                                    onCancel={() => cancelMutation.mutate(rdv.id)}
                                    cancelling={cancelMutation.isPending}
                                  />
                                ))}
                              </div>
                            </section>
                          )}

                          {/* RDV passés / annulés */}
                          {pastRdv.length > 0 && (
                            <section>
                              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                Historique ({pastRdv.length})
                              </h3>
                              <div className="space-y-3">
                                {pastRdv.map((rdv) => (
                                  <RdvCard key={rdv.id} rdv={rdv} past />
                                ))}
                              </div>
                            </section>
                          )}

                          <div className="pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to="/permanences">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                Voir toutes les permanences
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Onglet Carte adhérent ──────────────────────────────── */}
                <TabsContent value="carte">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Carte adhérent FOCOM
                      </CardTitle>
                      <CardDescription>
                        Votre carte d'adhérent numérique — téléchargeable ou imprimable
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <CarteAdherent
                        firstName={formData.first_name}
                        lastName={formData.last_name}
                        email={user.email || ""}
                        status={profile?.status || "actif"}
                        memberSince={profile?.created_at}
                        accessKey={profile?.access_key}
                        avatarUrl={avatarPreview}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Onglet Historique adhésions ────────────────────────── */}
                <TabsContent value="adhesions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Historique des adhésions
                      </CardTitle>
                      <CardDescription>
                        Suivi de vos adhésions au syndicat FOCOM UES Iliad
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {adhesions.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                            <History className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Aucune adhésion enregistrée</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href="/adhesion">Adhérer à FOCOM</a>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {adhesions.map((adhesion) => (
                            <div
                              key={adhesion.id}
                              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                              <div className="space-y-1 min-w-0">
                                <p className="font-medium text-sm text-foreground capitalize">
                                  {adhesion.type_adhesion}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {new Date(adhesion.date_debut).toLocaleDateString("fr-FR")}
                                  {" → "}
                                  {new Date(adhesion.date_fin).toLocaleDateString("fr-FR")}
                                </p>
                                {adhesion.montant && (
                                  <p className="text-xs text-muted-foreground">
                                    Montant : <span className="font-medium">{adhesion.montant} €</span>
                                  </p>
                                )}
                                {adhesion.commentaires && (
                                  <p className="text-xs text-muted-foreground italic">{adhesion.commentaires}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <Badge variant={adhesionStatusVariant[adhesion.status] || "outline"}>
                                  {adhesionStatusLabel[adhesion.status] || adhesion.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Onglet Sécurité ────────────────────────────────────── */}
                <TabsContent value="securite">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Changer le mot de passe
                      </CardTitle>
                      <CardDescription>Minimum 8 caractères avec au moins une majuscule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pw-next">Nouveau mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="pw-next" name="username"
                              type={showPw.next ? "text" : "password"}
                              value={pwData.next}
                              onChange={(e) => setPwData((p) => ({ ...p, next: e.target.value }))}
                              className={`pl-10 pr-10 ${pwErrors.next ? "border-destructive" : ""}`}
                              placeholder="Nouveau mot de passe" autoComplete="new-password"
                            />
                            <button
                              type="button" onClick={() => togglePw("next")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPw.next ? "Masquer" : "Afficher"}
                            >
                              {showPw.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {pwErrors.next && <p className="text-sm text-destructive">{pwErrors.next}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pw-confirm">Confirmer le mot de passe</Label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="pw-confirm"
                              type={showPw.confirm ? "text" : "password"}
                              value={pwData.confirm}
                              onChange={(e) => setPwData((p) => ({ ...p, confirm: e.target.value }))}
                              className={`pl-10 pr-10 ${pwErrors.confirm ? "border-destructive" : ""}`}
                              placeholder="Confirmez le mot de passe" autoComplete="new-password"
                            />
                            <button
                              type="button" onClick={() => togglePw("confirm")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPw.confirm ? "Masquer" : "Afficher"}
                            >
                              {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {pwErrors.confirm && <p className="text-sm text-destructive">{pwErrors.confirm}</p>}
                        </div>

                        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Critères requis</p>
                          {[
                            { label: "Au moins 8 caractères", ok: pwData.next.length >= 8 },
                            { label: "Une lettre majuscule (A-Z)", ok: /[A-Z]/.test(pwData.next) },
                            { label: "Un chiffre (0-9)", ok: /[0-9]/.test(pwData.next) },
                            { label: "Un caractère spécial (!@#...)", ok: /[^A-Za-z0-9]/.test(pwData.next) },
                          ].map(({ label, ok }) => (
                            <div key={label} className="flex items-center gap-2 text-xs">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${ok ? "bg-green-500" : "bg-slate-200"}`}>
                                {ok && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className={ok ? "text-green-700 font-medium" : "text-muted-foreground"}>{label}</span>
                            </div>
                          ))}
                          {pwData.next && (
                            <div className="pt-1 mt-1 border-t border-border">
                              <div className="flex gap-1">
                                {[
                                  pwData.next.length >= 8,
                                  /[A-Z]/.test(pwData.next),
                                  /[0-9]/.test(pwData.next),
                                  /[^A-Za-z0-9]/.test(pwData.next),
                                ].map((ok, i) => (
                                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${ok ? "bg-green-500" : "bg-slate-200"}`} />
                                ))}
                              </div>
                              <p className="text-xs text-center mt-1 font-medium">
                                {[
                                  pwData.next.length >= 8,
                                  /[A-Z]/.test(pwData.next),
                                  /[0-9]/.test(pwData.next),
                                  /[^A-Za-z0-9]/.test(pwData.next),
                                ].every(Boolean)
                                  ? <span className="text-green-600">✓ Mot de passe fort</span>
                                  : <span className="text-muted-foreground">Complétez les critères ci-dessus</span>}
                              </p>
                            </div>
                          )}
                        </div>

                        <Separator />
                        <div className="flex justify-stretch sm:justify-end">
                          <Button
                            type="submit"
                            disabled={pwSaving || !pwData.next || !pwData.confirm}
                            variant="outline"
                            className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            {pwSaving
                              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification...</>
                              : <><Lock className="mr-2 h-4 w-4" />Modifier le mot de passe</>}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── Sous-composant : carte RDV ───────────────────────────────────────────────

function RdvCard({
  rdv,
  past = false,
  onCancel,
  cancelling,
}: {
  rdv: RdvWithPermanence;
  past?: boolean;
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const statusCfg = rdvStatusConfig[rdv.statut] ?? rdvStatusConfig.en_attente;
  const StatusIcon = statusCfg.icon;
  const p = rdv.permanence;
  const isVisio = p.type === "visio" || !!p.visio_lien;

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${past ? "bg-muted/20 border-border opacity-75" : "bg-background border-border hover:bg-muted/10"}`}>
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{p.titre}</p>
          <p className="text-xs text-muted-foreground">{p.delegue_nom}</p>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${statusCfg.className}`}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </div>

      {/* Date / lieu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{formatDate(p.date_permanence)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatTime(p.heure_debut)} – {formatTime(p.heure_fin)}</span>
        </div>
        {(p.lieu || isVisio) && (
          <div className="flex items-center gap-1.5 col-span-2">
            {isVisio ? <Video className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
            {isVisio && p.visio_lien
              ? <a href={p.visio_lien} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">Rejoindre la visio</a>
              : <span className="truncate">{p.lieu}</span>}
          </div>
        )}
      </div>

      {/* Sujet */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span className="italic">{rdv.sujet}</span>
      </div>

      {/* Note du délégué */}
      {rdv.note_delegue && (
        <div className="flex items-start gap-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-700 mb-0.5">Note du délégué</p>
            <p className="text-amber-600">{rdv.note_delegue}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!past && rdv.statut !== "annule" && rdv.statut !== "effectue" && onCancel && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={cancelling}
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
          >
            {cancelling ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
            Annuler ce RDV
          </Button>
        </div>
      )}
    </div>
  );
}

export default Profile;
