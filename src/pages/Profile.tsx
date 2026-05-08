import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import CarteAdherent from "@/components/CarteAdherent";

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

const Profile = () => {
  const navigate = useNavigate();
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
          .eq("email", user.email)
          .single();

        if (profileData) {
          setProfile(profileData as ProfileData);
          setFormData({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            phone: profileData.phone || "",
          });
          setAvatarPreview(profileData.avatar_url || null);

          // Charger l'historique des adhésions
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
        await supabase.from("profiles").update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          phone: formData.phone || null,
        }).eq("email", user.email);
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
            {/* Carte résumé latérale */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader className="text-center pb-3">
                <div className="relative w-20 h-20 mx-auto mb-3 group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20" />
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
                  >
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                  </button>
                  {avatarPreview && !uploadingAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
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
                />
                <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP · 2 Mo max</p>
                <CardTitle className="text-base">{displayName}</CardTitle>
                <CardDescription className="text-xs">{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="space-y-2 text-xs text-muted-foreground">
                  {profile?.status && (
                    <div className="flex items-center justify-between gap-2">
                      <span>Statut</span>
                      <Badge
                        variant={profile.status === "actif" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {profile.status}
                      </Badge>
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      <span>
                        Depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {adhesions.filter(a => a.status === "validee").length > 0 && (
                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{adhesions.filter(a => a.status === "validee").length} adhésion(s) active(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Onglets principaux */}
            <div className="md:col-span-3">
              <Tabs defaultValue="infos" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="infos" className="gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Profil</span>
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

                {/* Onglet Profil */}
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
                              <Input
                                id="email" value={user.email || ""}
                                className="pl-10 bg-muted" disabled
                              />
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
                        <div className="flex justify-end">
                          <Button type="submit" disabled={saving}>
                            {saving
                              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                              : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Carte adhérent */}
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

                {/* Onglet Historique adhésions */}
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

                {/* Onglet Sécurité */}
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
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={pwSaving || !pwData.next || !pwData.confirm}
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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

export default Profile;
