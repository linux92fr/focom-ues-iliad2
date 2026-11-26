import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Wand2, Eye, EyeOff, Fingerprint } from "lucide-react";
import { generateStrongPassword, getPasswordError } from "@/lib/password";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState<string | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "passkey">("password");

  const handlePasskeyLogin = async () => {
    const email = loginEmail.trim();
    if (!email) {
      toast({
        title: "Email requis",
        description: "Saisissez votre email ci-dessus avant de vous connecter avec un passkey.",
        variant: "destructive",
      });
      return;
    }

    setPasskeyLoading(true);
    try {
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke(
        "webauthn-authenticate",
        { body: { action: "generate-options", email } }
      );
      if (optionsError || !optionsData?.options) {
        throw new Error(optionsData?.error || optionsError?.message || "Impossible de démarrer la connexion par passkey");
      }

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new DOMException("timeout", "TimeoutError")), 65000)
      );
      const credential = await Promise.race([startAuthentication({ optionsJSON: optionsData.options }), timeout]);

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        "webauthn-authenticate",
        { body: { action: "verify-authentication", credential } }
      );
      if (verifyError || !verifyData?.success) {
        throw new Error(verifyData?.error || verifyError?.message || "Passkey non reconnu");
      }

      const hashedToken = verifyData.linkData?.properties?.hashed_token;
      if (!hashedToken) throw new Error("Lien de connexion invalide");

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: hashedToken,
        type: "magiclink",
      });
      if (otpError) throw otpError;

      toast({ title: "Bienvenue !", description: "Vous êtes maintenant connecté." });
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        // Annulé par l'utilisateur, pas d'erreur à afficher
      } else if (err instanceof DOMException && err.name === "TimeoutError") {
        toast({
          title: "Délai dépassé",
          description: "La demande de passkey a mis trop de temps à répondre. Réessayez.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion par passkey impossible",
          description: err instanceof Error ? err.message : "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === "passkey") {
      await handlePasskeyLogin();
      return;
    }
    setLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (!error) {
        toast({
          title: "Bienvenue !",
          description: "Vous êtes maintenant connecté.",
        });
        onOpenChange(false);
        setLoginEmail("");
        setLoginPassword("");
        return;
      }
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSignupPassword = () => {
    setSignupPassword(generateStrongPassword());
    setSignupPasswordError(null);
    setShowSignupPassword(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = getPasswordError(signupPassword);
    if (passwordError) {
      setSignupPasswordError(passwordError);
      return;
    }
    setSignupPasswordError(null);
    setLoading(true);

    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName);

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
        onOpenChange(false);
        setSignupEmail("");
        setSignupPassword("");
        setSignupName("");
      }
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl border-slate-200 bg-white shadow-2xl sm:max-w-md"
        overlayClassName="bg-slate-950/55 backdrop-blur-md"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Espace Adhérent</DialogTitle>
          <DialogDescription>
            Connectez-vous pour accéder à votre espace personnel
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setLoginMethod("password")}
                aria-pressed={loginMethod === "password"}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 transition-colors ${loginMethod === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Lock className="h-4 w-4" />
                Mot de passe
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("passkey")}
                disabled={!browserSupportsWebAuthn()}
                title={browserSupportsWebAuthn() ? "Se connecter avec un passkey" : "Passkeys non supportées par ce navigateur"}
                aria-pressed={loginMethod === "passkey"}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 transition-colors disabled:opacity-50 ${loginMethod === "passkey" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Fingerprint className="h-4 w-4" />
                Passkey
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {loginMethod === "password" && (
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {loginMethod === "password" ? (
                <Button type="submit" className="w-full gap-2" disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion…
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              ) : (
                browserSupportsWebAuthn() && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    disabled={passkeyLoading}
                    onClick={handlePasskeyLogin}
                  >
                    {passkeyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                    {passkeyLoading ? "Vérification du passkey…" : "Se connecter avec un passkey"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center -mt-2">
                    Utilisez votre empreinte, Face ID ou clé de sécurité
                  </p>
                </>
                )
              )}
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jean Dupont"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="votre@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-auto py-1 px-2 text-xs gap-1.5"
                    onClick={handleGenerateSignupPassword}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Générer
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setSignupPasswordError(null);
                    }}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button" onClick={() => setShowSignupPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showSignupPassword ? "Masquer" : "Afficher"}
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupPasswordError ? (
                  <p className="text-xs text-destructive">{signupPasswordError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscription…
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
