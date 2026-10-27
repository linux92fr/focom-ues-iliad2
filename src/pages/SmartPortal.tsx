import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AssistantIAPage from "@/components/admin/AssistantIAPage";
import { Bot, Loader2, LogIn, LogOut, ShieldCheck, Mail } from "lucide-react";

type ViewState = "checking" | "signed-out" | "denied" | "allowed";

export default function SmartPortal() {
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const verifyAccess = async (userId: string) => {
    const { data, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (roleError) {
      setError("Impossible de vérifier les autorisations. Réessayez plus tard.");
      setState("denied");
      return;
    }
    if ((data ?? []).some((item) => item.role === "utilisateur_ia")) {
      setState("allowed");
    } else {
      setState("denied");
      setError("Ce compte n'a pas le rôle « Utilisateur IA ». Contactez un administrateur.");
    }
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session?.user) await verifyAccess(session.user.id);
      else setState("signed-out");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setState("signed-out");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void verifyAccess(session.user.id);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (loginError || !data.user) {
      setError("Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.");
      setBusy(false);
      return;
    }
    await verifyAccess(data.user.id);
    setBusy(false);
  };

  const requestPasswordReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Saisissez votre adresse e-mail avant de demander un nouveau mot de passe.");
      return;
    }
    setResetBusy(true);
    setError("");
    setResetRequested(false);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setResetRequested(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d’envoyer l’e-mail de réinitialisation.");
    } finally {
      setResetBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState("signed-out");
    setPassword("");
  };

  if (state === "checking") return <main className="flex min-h-screen items-center justify-center bg-background text-foreground"><Loader2 className="mr-3 h-5 w-5 animate-spin" />Vérification de votre accès…</main>;

  if (state === "allowed") return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto flex max-w-5xl items-center justify-between border-b border-border px-4 py-4">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div><div><p className="font-semibold">FO COM UES ILIAD</p><p className="text-xs text-muted-foreground">Espace IA sécurisé</p></div></div>
      <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"><LogOut className="h-4 w-4" />Déconnexion</button>
    </div>
    <AssistantIAPage />
  </div>;

  return <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4 text-foreground">
    <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Bot className="h-7 w-7 text-primary" /></div><h1 className="text-2xl font-bold">Espace IA</h1><p className="mt-2 text-sm text-muted-foreground">Connectez-vous avec le compte qui vous a été attribué.</p></div>
      <form onSubmit={login} className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium">Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-normal" placeholder="vous@exemple.fr" /></label>
        <label className="block space-y-1.5 text-sm font-medium">Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-normal" /></label>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Se connecter</button>
        <button type="button" onClick={() => void requestPasswordReset()} disabled={resetBusy} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-primary underline-offset-4 hover:underline disabled:opacity-60">{resetBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Mot de passe oublié ?</button>
        {resetRequested && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé. Vérifiez aussi vos courriers indésirables.</p>}
      </form>
      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Cet espace est réservé aux comptes auxquels le rôle « Utilisateur IA » a été attribué.</p>
    </section>
  </main>;
}
