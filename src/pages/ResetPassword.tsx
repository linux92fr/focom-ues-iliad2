import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

type Status = "checking" | "ready" | "invalid" | "success";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("ready");
      else setStatus((s) => (s === "checking" ? "invalid" : s));
    });

    const timeout = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!next || next.length < 8) newErrors.next = "Le mot de passe doit contenir au moins 8 caractères";
    else if (!/[A-Z]/.test(next)) newErrors.next = "Le mot de passe doit contenir au moins une majuscule";
    if (next !== confirm) newErrors.confirm = "Les mots de passe ne correspondent pas";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      setStatus("success");
      toast.success("Mot de passe défini avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de définir le mot de passe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Définir votre mot de passe</CardTitle>
          <CardDescription>
            {status === "success"
              ? "Votre mot de passe a bien été enregistré."
              : "Choisissez un mot de passe pour activer votre compte FOCOM UES ILIAD."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "checking" && (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Vérification du lien...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Ce lien est invalide ou a expiré. Demandez à un administrateur de vous renvoyer un email, ou connectez-vous si vous connaissez déjà votre mot de passe.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="next">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="next"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.next && <p className="text-xs text-destructive">{errors.next}</p>}
                <p className="text-xs text-muted-foreground">Minimum 8 caractères, avec au moins une majuscule.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Définir mon mot de passe"}
              </Button>
            </form>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <Button onClick={() => navigate("/profil")}>Accéder à mon espace</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
