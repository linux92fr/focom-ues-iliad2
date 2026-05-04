import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User, Mail, Phone, Loader2, Save, Lock, Eye, EyeOff,
  ShieldCheck, Camera, X,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: string | null;
  avatar_url: string | null;
  access_key: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();
        if (data) {
          setProfile(data as ProfileData);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
          });
          setAvatarPreview(data.avatar_url || null);
        }
      } catch { /* profil inexistant */ }
      finally { setLoading(false); }
    };
    if (user) fetchProfile();
  }, [user]);

  // ── Upload avatar ────────────────────────────────────────────
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

  // ── Infos personnelles ───────────────────────────────────────
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

  // ── Mot de passe ─────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground mt-2">Gérez vos informations personnelles et votre mot de passe</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Carte résumé + avatar */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold ring-4 ring-primary/20">
                      {initials}
                    </div>
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                  </button>
                  {avatarPreview && !uploadingAvatar && (
                    <button type="button" onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                <p className="text-xs text-muted-foreground mb-2">Cliquez sur la photo pour modifier · JPG, PNG, WebP · 2 Mo max</p>
                <CardTitle>{displayName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  {profile?.status && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Statut :</span>
                      <span className="capitalize">{profile.status}</span>
                    </div>
                  )}
                  {profile?.access_key && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium shrink-0">Clé d'accès :</span>
                      <span className="font-mono text-xs break-all">{profile.access_key}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colonne droite */}
            <div className="md:col-span-2 space-y-6">
              {/* Infos personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Informations personnelles</CardTitle>
                  <CardDescription>Modifiez vos informations de contact</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Votre prénom" maxLength={100} className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Votre nom" maxLength={100} className="pl-10" />
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
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="06 12 34 56 78" maxLength={20} className="pl-10" />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Changement de mot de passe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Changer le mot de passe</CardTitle>
                  <CardDescription>Minimum 8 caractères avec au moins une majuscule</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pw-next">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="pw-next" name="username" type={showPw.next ? "text" : "password"}
                          value={pwData.next} onChange={(e) => setPwData((p) => ({ ...p, next: e.target.value }))}
                          className={`pl-10 pr-10 ${pwErrors.next ? "border-destructive" : ""}`}
                          placeholder="Nouveau mot de passe" autoComplete="new-password" />
                        <button type="button" onClick={() => togglePw("next")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPw.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {pwErrors.next && <p className="text-sm text-destructive">{pwErrors.next}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pw-confirm">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="pw-confirm" type={showPw.confirm ? "text" : "password"}
                          value={pwData.confirm} onChange={(e) => setPwData((p) => ({ ...p, confirm: e.target.value }))}
                          className={`pl-10 pr-10 ${pwErrors.confirm ? "border-destructive" : ""}`}
                          placeholder="Confirmez le mot de passe" autoComplete="new-password" />
                        <button type="button" onClick={() => togglePw("confirm")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {pwErrors.confirm && <p className="text-sm text-destructive">{pwErrors.confirm}</p>}
                    </div>

                    {pwData.next && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[pwData.next.length >= 8, /[A-Z]/.test(pwData.next), /[0-9]/.test(pwData.next), /[^A-Za-z0-9]/.test(pwData.next)].map((ok, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${ok ? "bg-green-500" : "bg-slate-200"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[
                            pwData.next.length < 8 && "8 caractères min",
                            !/[A-Z]/.test(pwData.next) && "une majuscule",
                            !/[0-9]/.test(pwData.next) && "un chiffre",
                            !/[^A-Za-z0-9]/.test(pwData.next) && "un caractère spécial",
                          ].filter(Boolean).join(" · ") || "✓ Mot de passe fort"}
                        </p>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={pwSaving || !pwData.next || !pwData.confirm}
                        variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        {pwSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification...</> : <><Lock className="mr-2 h-4 w-4" />Modifier le mot de passe</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;