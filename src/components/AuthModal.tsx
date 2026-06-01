import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Loader2, Mail, Lock, User, Fingerprint, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useWebAuthn, isPlatformAuthenticatorAvailable } from "@/hooks/useWebAuthn";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { authenticateWithPasskey, isLoading: passkeyLoading } = useWebAuthn();

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
  }, []);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bienvenue !",
        description: "Vous êtes maintenant connecté.",
      });
      onOpenChange(false);
      setLoginEmail("");
      setLoginPassword("");
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

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

    setLoading(false);
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          scopes: 'email',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Erreur lors de la connexion Facebook');
      setFacebookLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setAuthError(null);
    try {
      const result = await authenticateWithPasskey(loginEmail || undefined);
      if (result.success && result.linkData) {
        const properties = result.linkData.properties;
        const { error } = await supabase.auth.verifyOtp({
          token_hash: properties.hashed_token,
          type: 'magiclink',
        });
        if (error) throw error;
        toast({
          title: `Bienvenue${result.user?.first_name ? ` ${result.user.first_name}` : ''} !`,
          description: "Vous êtes connecté avec votre passkey.",
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erreur lors de la connexion avec passkey');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Espace Adhérent</DialogTitle>
          <DialogDescription>
            Connectez-vous pour accéder à votre espace personnel
          </DialogDescription>
        </DialogHeader>

        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {passkeyAvailable && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
            >
              {passkeyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Fingerprint className="h-4 w-4 mr-2" />
              )}
              Se connecter avec une passkey
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleFacebookLogin}
            disabled={facebookLoading}
          >
            {facebookLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            Continuer avec Facebook
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Se connecter"
                )}
              </Button>
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
                    placeholder="votre@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10"
                    minLength={12}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 12 caractères
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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
