import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Fingerprint, Mail, ShieldCheck, KeyRound, Smartphone, Lock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWebAuthn, isPlatformAuthenticatorAvailable } from "@/hooks/useWebAuthn";
import { useToast } from "@/hooks/use-toast";
import logoFocom from "@/assets/logo-focom.png";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "magic-link-sent" | "passkey-login";

const PASSKEY_BENEFITS = [
  { icon: Lock,         text: "Aucun mot de passe à retenir ou à pirater" },
  { icon: Smartphone,   text: "Déverrouillage par empreinte, visage ou code PIN" },
  { icon: ShieldCheck,  text: "Résistant au phishing et aux fuites de données" },
  { icon: CheckCircle2, text: "Standard mondial recommandé par l'ANSSI" },
];

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { toast } = useToast();
  const { authenticateWithPasskey, isLoading: passkeyLoading } = useWebAuthn();
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
  }, []);

  useEffect(() => {
    if (!open) { setStep("choose"); setEmail(""); setName(""); setError(null); }
  }, [open]);

  // Connexion via passkey
  const handlePasskey = async () => {
    setError(null);
    try {
      const result = await authenticateWithPasskey(email || undefined);
      if (result.success && result.linkData) {
        const properties = (result.linkData as { properties: { hashed_token: string } }).properties;
        const { error } = await supabase.auth.verifyOtp({ token_hash: properties.hashed_token, type: "magiclink" });
        if (error) throw error;
        toast({ title: `Bienvenue${result.user?.first_name ? ` ${result.user.first_name}` : ""} !`, description: "Connecté avec votre passkey." });
        onOpenChange(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur passkey");
    }
  };

  // Inscription / connexion via magic link (sans mot de passe)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
          data: name ? { display_name: name } : undefined,
        },
      });
      if (error) throw error;
      setStep("magic-link-sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur envoi email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl">

        {/* En-tête */}
        <div className="bg-gradient-to-br from-[#13233A] to-[#1e3a5f] px-6 pt-6 pb-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <img src={logoFocom} alt="FOCOM" className="h-10 w-10 object-contain" />
              <div>
                <DialogTitle className="text-white text-lg font-bold">Espace Adhérent</DialogTitle>
                <p className="text-white/60 text-xs">FOCOM UES ILIAD</p>
              </div>
            </div>
          </DialogHeader>

          {/* Bannière sécurité passkey */}
          <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
            <p className="text-xs font-semibold text-white/90 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Authentification sans mot de passe — la plus sécurisée
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PASSKEY_BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-1.5">
                  <Icon className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/70 leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {step === "choose" && (
            <>
              {/* Passkey */}
              {passkeyAvailable && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-2">
                      <Fingerprint className="w-7 h-7 text-red-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Connexion avec passkey</p>
                    <p className="text-xs text-slate-500 mt-0.5">Utilisez votre empreinte, visage ou code PIN</p>
                  </div>
                  <Button
                    onClick={handlePasskey}
                    disabled={passkeyLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-11 rounded-xl gap-2 font-semibold"
                  >
                    {passkeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                    Se connecter avec passkey
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wide">Ou</span></div>
                  </div>
                </div>
              )}

              {/* Magic link (inscription / connexion sans passkey) */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3" /> Prénom et nom <span className="text-slate-400">(première inscription)</span>
                  </Label>
                  <Input
                    id="auth-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-email" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Adresse email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  variant="outline"
                  className="w-full h-11 rounded-xl gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Recevoir un lien de connexion
                </Button>
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Un lien sécurisé vous sera envoyé par email. Aucun mot de passe requis.
                </p>
              </form>
            </>
          )}

          {step === "magic-link-sent" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email envoyé !</p>
                <p className="text-sm text-slate-500 mt-1">Vérifiez votre boîte mail à <strong>{email}</strong> et cliquez sur le lien de connexion.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Conseil sécurité
                </p>
                <p className="text-xs text-amber-600">Une fois connecté, pensez à enregistrer une passkey depuis votre profil pour vous connecter encore plus facilement la prochaine fois.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("choose")} className="text-xs text-slate-400">
                ← Retour
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
