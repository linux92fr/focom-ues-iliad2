import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useWebAuthn, isPlatformAuthenticatorAvailable } from "@/hooks/useWebAuthn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User, Mail, Phone, Loader2, Save, Lock, Eye, EyeOff, ShieldCheck,
  Camera, X, Fingerprint, Smartphone, Key, Trash2, Pencil, Plus,
  Monitor, Usb,
} from "lucide-react";

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

interface Passkey {
  id: string;
  credential_id: string;
  friendly_name: string | null;
  device_type: string | null;
  transports: string[] | null;
  created_at: string;
  last_used_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function passkeyIcon(p: Passkey) {
  const transports = p.transports ?? [];
  if (transports.includes('internal') || p.device_type === 'singleDevice') return Smartphone;
  if (transports.includes('usb')) return Usb;
  if (p.device_type === 'multiDevice') return Monitor;
  return Key;
}

function passkeyLabel(p: Passkey) {
  if (p.friendly_name) return p.friendly_name;
  const transports = p.transports ?? [];
  if (transports.includes('internal')) return 'Passkey interne';
  if (transports.includes('usb')) return 'Clé USB';
  return 'Passkey';
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Composant ────────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { registerPasskey, isLoading: passkeyLoading } = useWebAuthn();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "" });

  const [pwData, setPwData] = useState({ next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ next: false, confirm: false });

  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; passkey: Passkey | null }>({ open: false, passkey: null });
  const [renameName, setRenameName] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; passkey: Passkey | null }>({ open: false, passkey: null });
  const [addDialog, setAddDialog] = useState(false);
  const [addName, setAddName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
  }, []);

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
        }
      } catch { /* profil inexistant */ }
      finally { setLoading(false); }
    };
    if (user) fetchData();
  }, [user]);

  // ─── Passkeys ────────────────────────────────────────────────────────────

  const { data: passkeys = [], isLoading: passkeysLoading } = useQuery({
    queryKey: ["profile-passkeys", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passkey_credentials")
        .select("id, credential_id, friendly_name, device_type, transports, created_at, last_used_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Passkey[];
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("passkey_credentials")
        .update({ friendly_name: name.trim() || null })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-passkeys"] });
      setRenameDialog({ open: false, passkey: null });
      toast.success("Passkey renommée");
    },
    onError: () => toast.error("Impossible de renommer la passkey"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("passkey_credentials")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-passkeys"] });
      setDeleteDialog({ open: false, passkey: null });
      toast.success("Passkey supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la passkey"),
  });

  const handleAddPasskey = async () => {
    try {
      await registerPasskey(addName.trim() || undefined);
      queryClient.invalidateQueries({ queryKey: ["profile-passkeys"] });
      setAddDialog(false);
      setAddName("");
      toast.success("Passkey enregistrée avec succès");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  };

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
    if (!pwData.next || pwData.next.length < 12)
      errors.next = "Le mot de passe doit contenir au moins 12 caractères";
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

  const pwCriteria = [
    { label: "Au moins 12 caractères", ok: pwData.next.length >= 12 },
    { label: "Une lettre majuscule (A-Z)", ok: /[A-Z]/.test(pwData.next) },
    { label: "Un chiffre (0-9)", ok: /[0-9]/.test(pwData.next) },
    { label: "Un caractère spécial (!@#...)", ok: /[^A-Za-z0-9]/.test(pwData.next) },
  ];
  const pwStrength = pwCriteria.filter((c) => c.ok).length;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos informations personnelles et votre sécurité
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
            </Card>

            {/* ── Onglets ────────────────────────────────────────────────── */}
            <div className="md:col-span-3">
              <Tabs defaultValue="infos" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="infos" className="gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span>Informations</span>
                  </TabsTrigger>
                  <TabsTrigger value="securite" className="gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sécurité</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Onglet Informations ───────────────────────────────── */}
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

                {/* ── Onglet Sécurité ───────────────────────────────────── */}
                <TabsContent value="securite" className="space-y-4">

                  {/* ── Passkeys ─────────────────────────────────────────── */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Fingerprint className="h-5 w-5" /> Passkeys
                          </CardTitle>
                          <CardDescription>
                            Connexion biométrique ou clé de sécurité — sans mot de passe
                          </CardDescription>
                        </div>
                        {passkeyAvailable && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 gap-1.5"
                            onClick={() => { setAddName(""); setAddDialog(true); }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {passkeysLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : passkeys.length === 0 ? (
                        <div className="text-center py-8 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                            <Fingerprint className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Aucune passkey enregistrée</p>
                          {passkeyAvailable ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setAddName(""); setAddDialog(true); }}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1.5" />
                              Enregistrer une passkey
                            </Button>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Votre appareil ne supporte pas les passkeys
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {passkeys.map((pk) => {
                            const Icon = passkeyIcon(pk);
                            return (
                              <div
                                key={pk.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4.5 h-4.5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {passkeyLabel(pk)}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs text-muted-foreground">
                                        Ajoutée le {fmtDate(pk.created_at)}
                                      </span>
                                      {pk.last_used_at && (
                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                          Utilisée le {fmtDate(pk.last_used_at)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    title="Renommer"
                                    onClick={() => {
                                      setRenameName(pk.friendly_name || "");
                                      setRenameDialog({ open: true, passkey: pk });
                                    }}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title="Supprimer"
                                    onClick={() => setDeleteDialog({ open: true, passkey: pk })}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* ── Mot de passe ─────────────────────────────────────── */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Changer le mot de passe
                      </CardTitle>
                      <CardDescription>Minimum 12 caractères avec majuscule, chiffre et caractère spécial</CardDescription>
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
                          {pwCriteria.map(({ label, ok }) => (
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
                                {pwCriteria.map((c, i) => (
                                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${c.ok ? "bg-green-500" : "bg-slate-200"}`} />
                                ))}
                              </div>
                              <p className="text-xs text-center mt-1 font-medium">
                                {pwStrength === 4
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

      {/* ── Dialog : ajouter une passkey ──────────────────────────────────── */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" /> Ajouter une passkey
            </DialogTitle>
            <DialogDescription>
              Donnez un nom à cette passkey pour la retrouver facilement (facultatif).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="add-passkey-name">Nom (facultatif)</Label>
            <Input
              id="add-passkey-name"
              placeholder="ex : MacBook Touch ID, iPhone Face ID…"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddPasskey} disabled={passkeyLoading} className="gap-1.5">
              {passkeyLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Fingerprint className="w-4 h-4" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : renommer une passkey ────────────────────────────────── */}
      <Dialog open={renameDialog.open} onOpenChange={(o) => setRenameDialog({ open: o, passkey: o ? renameDialog.passkey : null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renommer la passkey</DialogTitle>
            <DialogDescription>
              Choisissez un nom pour identifier cet appareil.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-passkey">Nom</Label>
            <Input
              id="rename-passkey"
              placeholder="ex : MacBook Touch ID"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, passkey: null })}>Annuler</Button>
            <Button
              onClick={() => renameDialog.passkey && renameMutation.mutate({ id: renameDialog.passkey.id, name: renameName })}
              disabled={renameMutation.isPending}
            >
              {renameMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : supprimer une passkey ───────────────────────────────── */}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, passkey: o ? deleteDialog.passkey : null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la passkey</DialogTitle>
            <DialogDescription>
              Vous ne pourrez plus vous connecter avec{" "}
              <strong>{deleteDialog.passkey ? passkeyLabel(deleteDialog.passkey) : "cette passkey"}</strong>.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, passkey: null })}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.passkey && deleteMutation.mutate(deleteDialog.passkey.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
