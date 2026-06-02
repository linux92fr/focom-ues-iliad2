import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, User, Fingerprint, KeyRound, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useWebAuthn, isPlatformAuthenticatorAvailable } from "@/hooks/useWebAuthn";
import logoFocom from "@/assets/logo-focom.png";

const ADMIN_ROLES = ["admin", "secretaire", "representant", "redacteur", "tresorier"];

async function fetchUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0].role as string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const { authenticateWithPasskey, isLoading: passkeyLoading } = useWebAuthn();

  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  // Connexion par passkey + vérification du rôle admin
  const handlePasskey = async () => {
    setError("");
    try {
      const result = await authenticateWithPasskey();
      if (!result.success || !result.linkData) {
        setError("Authentification passkey échouée. Réessayez ou utilisez le mot de passe.");
        return;
      }
      const properties = (result.linkData as { properties: { hashed_token: string } }).properties;
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        token_hash: properties.hashed_token,
        type: "magiclink",
      });
      if (otpError || !otpData.user) throw otpError ?? new Error("Session invalide");

      const role = await fetchUserRole(otpData.user.id);
      if (!role || !ADMIN_ROLES.includes(role)) {
        await supabase.auth.signOut();
        setError("Accès refusé : votre compte n'a pas les droits d'administration.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur passkey");
    }
  };

  // Connexion par mot de passe (solution de secours)
  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/admin", { replace: true });
      } else {
        setError("Identifiants incorrects ou droits insuffisants.");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#13233A] via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-[#13233A] to-[#1e3a5f] px-6 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/20">
                <img src={logoFocom} alt="FOCOM" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">FOCOM UES ILIAD</h1>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Shield className="w-3.5 h-3.5 text-red-300" />
              <p className="text-red-100 text-xs font-medium tracking-wide uppercase">Portail d'administration</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4">

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Passkey (méthode principale) ─────────────────────────── */}
            {passkeyAvailable && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Fingerprint className="w-7 h-7 text-[#13233A]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Connexion sécurisée</p>
                  <p className="text-xs text-slate-500 mt-0.5">Empreinte, visage ou code PIN — aucun mot de passe</p>
                </div>
                <Button
                  onClick={handlePasskey}
                  disabled={passkeyLoading}
                  className="w-full bg-[#13233A] hover:bg-[#1e3a5f] text-white h-11 rounded-xl gap-2 font-semibold"
                >
                  {passkeyLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Fingerprint className="w-4 h-4" />}
                  Se connecter avec passkey
                </Button>
              </div>
            )}

            {/* ── Solution de secours ───────────────────────────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setShowFallback((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {passkeyAvailable ? "Accès de secours (mot de passe)" : "Connexion par identifiants"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFallback ? "rotate-180" : ""}`} />
              </button>

              {(!passkeyAvailable || showFallback) && (
                <form onSubmit={handlePassword} className="space-y-3 mt-3">
                  {passkeyAvailable && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                      À utiliser uniquement en cas de perte de votre appareil.
                    </p>
                  )}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nom d'utilisateur ou email"
                      className="pl-10 rounded-xl h-10 text-sm"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="pl-10 pr-10 rounded-xl h-10 text-sm"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !username || !password}
                    variant="outline"
                    className="w-full h-10 rounded-xl gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Se connecter
                  </Button>
                </form>
              )}
            </div>

            <div className="text-center pt-1">
              <a href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                ← Retour au site
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Accès réservé aux administrateurs autorisés
        </p>
      </div>
    </div>
  );
}
