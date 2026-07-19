import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, CheckCircle2, Wand2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { generateStrongPassword, getPasswordCriteria, getPasswordError } from "@/lib/password";

type Status = "checking" | "ready" | "invalid" | "success";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [email, setEmail] = useState("");
  const [timeoutUncertain, setTimeoutUncertain] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStatus("ready");
        if (session.user?.email) setEmail(session.user.email);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("ready");
        if (session.user?.email) setEmail(session.user.email);
      } else {
        setStatus((s) => (s === "checking" ? "invalid" : s));
      }
    });

    const timeout = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleGenerate = () => {
    const generated = generateStrongPassword();
    setNext(generated);
    setConfirm(generated);
    setShowNext(true);
    setErrors({});
    setTimeoutUncertain(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const passwordError = getPasswordError(next);
    if (passwordError) newErrors.next = passwordError;
    if (next !== confirm) newErrors.confirm = "Les mots de passe ne correspondent pas";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setTimeoutUncertain(null);
    setSaving(true);
    const submittedPassword = next;
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new DOMException("timeout", "TimeoutError")), 15000)
      );
      const { error } = await Promise.race([supabase.auth.updateUser({ password: submittedPassword }), timeout]);
      if (error) throw error;
      setStatus("success");
      toast.success("Mot de passe défini avec succès");
    } catch (err) {
      console.error("Échec de la définition du mot de passe:", err);
      if (err instanceof DOMException && err.name === "TimeoutError") {
        setTimeoutUncertain(submittedPassword);
      } else {
        toast.error(err instanceof Error ? err.message : "Impossible de définir le mot de passe");
      }
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
              <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="next">Nouveau mot de passe</Label>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-auto py-1 px-2 text-xs gap-1.5"
                    onClick={handleGenerate}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Générer un mot de passe sécurisé
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="next"
                    type={showNext ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowNext((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showNext ? "Masquer" : "Afficher"}
                  >
                    {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.next && <p className="text-xs text-destructive">{errors.next}</p>}
                {next && (
                  <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
                    {[
                      { label: "Au moins 8 caractères", ok: getPasswordCriteria(next).length },
                      { label: "Une minuscule (a-z)", ok: getPasswordCriteria(next).lower },
                      { label: "Une majuscule (A-Z)", ok: getPasswordCriteria(next).upper },
                      { label: "Un chiffre (0-9)", ok: getPasswordCriteria(next).digit },
                      { label: "Un caractère spécial (!@#...)", ok: getPasswordCriteria(next).symbol },
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
                  </div>
                )}
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

              {timeoutUncertain && (
                <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">La réponse a mis trop de temps à arriver, mais le mot de passe a peut-être quand même été enregistré.</p>
                    <p>Essayez de vous connecter directement avec le mot de passe que vous venez de saisir :</p>
                    <p className="font-mono font-semibold select-all break-all bg-white/70 rounded px-2 py-1">{timeoutUncertain}</p>
                    <p>Si la connexion échoue, réessayez de définir votre mot de passe ci-dessus.</p>
                  </div>
                </div>
              )}

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
