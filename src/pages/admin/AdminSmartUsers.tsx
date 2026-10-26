import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus, RefreshCw, UserRoundX, UserRoundCheck, Users, ShieldAlert } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type SmartUser = { id: string; email: string; created_at: string | null; disabled: boolean };

function SmartUsersContent() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState<SmartUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const invokeAdmin = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("smart-users-admin", { body: payload });
    if (error) {
      const detail = (data as { error?: string } | null)?.error;
      throw new Error(detail || error.message || "La demande a échoué.");
    }
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await invokeAdmin({ action: "list" });
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Chargement impossible.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await invokeAdmin({ action: "create", email: email.trim().toLowerCase(), password });
      toast.success("Compte Smart créé. Communiquez les identifiants à son destinataire de manière sécurisée.");
      setEmail("");
      setPassword("");
      await loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Création du compte impossible.");
    } finally {
      setSaving(false);
    }
  };

  const addExistingUser = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await invokeAdmin({ action: "add-existing", email: existingEmail.trim().toLowerCase() });
      toast.success(result.alreadyAssigned
        ? "Ce compte possède déjà l'accès Smart."
        : "Accès Smart attribué au compte existant. Son mot de passe et ses autres rôles n'ont pas été modifiés.");
      setExistingEmail("");
      await loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Attribution de l'accès Smart impossible.");
    } finally {
      setSaving(false);
    }
  };

  const setDisabled = async (account: SmartUser, disabled: boolean) => {
    setBusyId(account.id);
    try {
      await invokeAdmin({ action: disabled ? "disable" : "enable", userId: account.id });
      toast.success(disabled ? "Compte désactivé." : "Compte réactivé.");
      await loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Modification impossible.");
    } finally {
      setBusyId("");
    }
  };

  if (user?.role !== "admin") return <div className="mx-auto mt-12 max-w-xl rounded-xl border bg-white p-8 text-center"><ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-600" /><h2 className="font-bold text-lg">Accès réservé aux administrateurs</h2><p className="mt-2 text-sm text-slate-500">Votre compte ne permet pas de gérer les utilisateurs Smart.</p></div>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold">Utilisateurs Smart</h2><p className="mt-1 text-sm text-muted-foreground">Créez et gérez les comptes dédiés à l’espace IA, sans leur donner de droits d’administration.</p></div><Button variant="outline" onClick={() => void loadUsers()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Actualiser</Button></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Créer un compte Smart</CardTitle></CardHeader><CardContent><form onSubmit={createUser} className="grid gap-4 md:grid-cols-3 md:items-end">
      <div className="space-y-2"><Label htmlFor="smart-email">Adresse e-mail</Label><Input id="smart-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="utilisateur@exemple.fr" /></div>
      <div className="space-y-2"><Label htmlFor="smart-password">Mot de passe initial</Label><Input id="smart-password" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} placeholder="12 caractères minimum" /><p className="text-xs text-muted-foreground">Préférez un mot de passe temporaire unique.</p></div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Créer le compte</Button>
    </form><p className="mt-4 text-xs text-muted-foreground">Le compte reçoit uniquement le rôle « utilisateur_ia » via cette interface. La création et les contrôles de droits sont exécutés côté serveur.</p></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserRoundCheck className="h-5 w-5" />Donner accès à un compte existant</CardTitle></CardHeader><CardContent>
      <p className="mb-4 text-sm text-muted-foreground">Utilisez cette option si l’adresse e-mail possède déjà un compte dans Supabase. Seul le rôle « utilisateur_ia » sera ajouté ; le mot de passe et les autres rôles resteront inchangés.</p>
      <form onSubmit={addExistingUser} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2"><Label htmlFor="smart-existing-email">Adresse e-mail exacte du compte existant</Label><Input id="smart-existing-email" type="email" autoComplete="email" required value={existingEmail} onChange={e => setExistingEmail(e.target.value)} placeholder="utilisateur@exemple.fr" /></div>
        <Button type="submit" variant="outline" disabled={saving || !existingEmail.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRoundCheck className="mr-2 h-4 w-4" />}Attribuer l’accès Smart</Button>
      </form>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Comptes existants <Badge variant="secondary">{users.length}</Badge></CardTitle></CardHeader><CardContent>
      {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement des comptes…</div> : users.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Aucun compte Smart trouvé.</p> : <div className="divide-y">{users.map(account => <div key={account.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-all font-medium">{account.email}</p><p className="mt-1 text-xs text-muted-foreground">Créé le {account.created_at ? new Date(account.created_at).toLocaleDateString("fr-FR") : "date inconnue"}</p></div><div className="flex items-center gap-3">{account.disabled ? <Badge variant="destructive">Désactivé</Badge> : <Badge variant="secondary">Actif</Badge>}{account.disabled ? <Button size="sm" variant="outline" disabled={busyId === account.id} onClick={() => void setDisabled(account, false)}>{busyId === account.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRoundCheck className="mr-2 h-4 w-4" />}Réactiver</Button> : <Button size="sm" variant="destructive" disabled={busyId === account.id} onClick={() => void setDisabled(account, true)}>{busyId === account.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRoundX className="mr-2 h-4 w-4" />}Désactiver</Button>}</div></div>)}</div>}
    </CardContent></Card>
  </div>;
}

export default function AdminSmartUsers() {
  return <AdminAuthGuard><AdminLayout title="Utilisateurs Smart" breadcrumb={["Administration", "Utilisateurs Smart"]}><SmartUsersContent /></AdminLayout></AdminAuthGuard>;
}
