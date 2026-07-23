import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Filter, Eye, Edit, X, Save, Loader2, Shield, UserPlus, Trash2, Mail } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserRole = Tables<"user_roles">["role"];
type MemberStatus = "actif" | "inactif" | "suspendu";
type ModalMode = "view" | "edit";
type ProfileWithRoles = Profile & { roles?: UserRole[] };

const roleOptions: UserRole[] = ["adherent", "representant", "redacteur", "secretaire", "tresorier", "visio", "admin"];

const statusLabel: Record<MemberStatus, string> = { actif: "Actif", inactif: "Inactif", suspendu: "Suspendu" };
const statusBadgeClass: Record<MemberStatus, string> = { actif: "bg-green-100 text-green-700", inactif: "bg-slate-100 text-slate-600", suspendu: "bg-red-100 text-red-600" };
const roleLabel: Record<string, string> = { admin: "Admin", secretaire: "Secrétaire", representant: "Représentant", redacteur: "Rédacteur", adherent: "Adhérent", public: "Public", tresorier: "Trésorier", visio: "Visio" };
const roleBadgeClass: Record<string, string> = { admin: "bg-red-100 text-red-700", secretaire: "bg-purple-100 text-purple-700", representant: "bg-teal-100 text-teal-700", redacteur: "bg-blue-100 text-blue-700", adherent: "bg-green-100 text-green-700", public: "bg-slate-100 text-slate-600", tresorier: "bg-amber-100 text-amber-700", visio: "bg-cyan-100 text-cyan-700" };

const initials = (p: Profile) => `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase();
const fullName = (p: Profile) => `${p.first_name || ""} ${p.last_name || ""}`.trim();
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function RoleBadges({ roles }: { roles?: UserRole[] }) {
  const list = roles?.length ? roles : ["adherent" as UserRole];
  return <div className="flex flex-wrap gap-1.5">{list.map((role) => <Badge key={role} className={`text-[10px] px-2 py-0.5 ${roleBadgeClass[role] || "bg-slate-100 text-slate-600"}`}>{roleLabel[role] || role}</Badge>)}</div>;
}

export default function AdminAdherents() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"Tous" | MemberStatus>("Tous");
  const [modal, setModal] = useState<{ mode: ModalMode; item: ProfileWithRoles } | null>(null);
  const [editForm, setEditForm] = useState<{ phone: string; status: MemberStatus; roles: UserRole[] }>({ phone: "", status: "actif", roles: [] });
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "adherent" as UserRole });
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-adherents"],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*").order("last_name", { ascending: true });
      if (profilesError) throw profilesError;
      const { data: rolesData, error: rolesError } = await supabase.from("user_roles").select("user_id, role");
      if (rolesError) throw rolesError;
      const rolesByUser = new Map<string, UserRole[]>();
      (rolesData || []).forEach((row) => {
        const existing = rolesByUser.get(row.user_id) || [];
        existing.push(row.role as UserRole);
        rolesByUser.set(row.user_id, existing);
      });
      return ((profilesData || []) as Profile[]).map((profile) => ({ ...profile, roles: rolesByUser.get(profile.id) || [] })) as ProfileWithRoles[];
    },
  });

  const adminCount = profiles.filter((p) => p.roles?.includes("admin" as UserRole)).length;
  const representantCount = profiles.filter((p) => p.roles?.includes("representant" as UserRole)).length;

  const updateMutation = useMutation({
    mutationFn: async ({ profile, updates, roles }: { profile: ProfileWithRoles; updates: Partial<Profile>; roles: UserRole[] }) => {
      const currentRoles = profile.roles || [];
      if (roles.length === 0) throw new Error("Sélectionnez au moins un rôle.");

      const removesAdmin = currentRoles.includes("admin" as UserRole) && !roles.includes("admin" as UserRole);
      if (removesAdmin) {
        const { count, error: countError } = await supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");
        if (countError) throw countError;
        if ((count ?? 0) <= 1) throw new Error("Impossible de retirer le rôle Admin au dernier administrateur.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error: profileError } = await supabase.from("profiles").update(updates).eq("id", profile.id);
      if (profileError) throw profileError;

      const { data: freshRolesData, error: freshRolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id);
      if (freshRolesError) throw freshRolesError;
      const freshRoles = (freshRolesData || []).map((row) => row.role as UserRole);

      const toRemove = freshRoles.filter((role) => !roles.includes(role));
      const toAdd = roles.filter((role) => !freshRoles.includes(role));

      if (toRemove.length > 0) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", profile.id).in("role", toRemove);
        if (error) throw error;
      }
      if (toAdd.length > 0) {
        const rows = toAdd.map((role) => ({ user_id: profile.id, role, assigned_by: user?.id || null }));
        const { error } = await supabase.from("user_roles").insert(rows as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-adherents"] });
      toast.success("Adhérent et rôles mis à jour");
      setModal(null);
    },
    onError: (error) => {
      console.error("Erreur mise à jour adhérent", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profile: ProfileWithRoles) => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: profile.id }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur lors de la suppression");
    },
    onSuccess: (_data, profile) => {
      queryClient.invalidateQueries({ queryKey: ["admin-adherents"] });
      toast.success(`${fullName(profile)} supprimé`);
    },
    onError: (error) => {
      console.error("Erreur suppression adhérent", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    },
  });

  const handleDelete = (profile: ProfileWithRoles) => {
    if (profile.id === currentUserId) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer définitivement ${fullName(profile)} (${profile.email}) ? Cette action est irréversible.`)) return;
    deleteMutation.mutate(profile);
  };

  const resendMutation = useMutation({
    mutationFn: async (profile: ProfileWithRoles) => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-user-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ email: profile.email, firstName: profile.first_name, lastName: profile.last_name, role: profile.roles?.[0] }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur lors de l'envoi de l'email");
    },
    onSuccess: (_data, profile) => {
      toast.success(`Email envoyé à ${profile.email}`);
    },
    onError: (error) => {
      console.error("Erreur envoi email de confirmation", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email");
    },
  });

  const handleResend = (profile: ProfileWithRoles) => {
    if (!window.confirm(`Envoyer l'email de confirmation d'inscription à ${profile.email} ?`)) return;
    resendMutation.mutate(profile);
  };

  const filtered = profiles.filter((p) => {
    const matchStatus = selectedStatus === "Tous" || p.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const rolesText = (p.roles || []).join(" ").toLowerCase();
    return matchStatus && (!q || (p.first_name || "").toLowerCase().includes(q) || (p.last_name || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q) || rolesText.includes(q));
  });

  const openView = (item: ProfileWithRoles) => setModal({ mode: "view", item });
  const openEdit = (item: ProfileWithRoles) => {
    setEditForm({ phone: item.phone ?? "", status: item.status as MemberStatus, roles: item.roles?.length ? item.roles : ["adherent" as UserRole] });
    setModal({ mode: "edit", item });
  };
  const isLastAdminBeingEdited = modal?.mode === "edit" && modal.item.roles?.includes("admin" as UserRole) && adminCount <= 1;
  const toggleRole = (role: UserRole) => {
    if (role === "admin" && isLastAdminBeingEdited && editForm.roles.includes("admin" as UserRole)) {
      toast.error("Impossible de retirer le rôle Admin au dernier administrateur.");
      return;
    }
    setEditForm((f) => ({ ...f, roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role] }));
  };
  const handleSave = () => {
    if (!modal) return;
    updateMutation.mutate({ profile: modal.item, updates: { phone: editForm.phone || null, status: editForm.status }, roles: editForm.roles });
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password) { toast.error("Email et mot de passe requis"); return; }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(createForm),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur");
      toast.success(`Utilisateur ${createForm.email} créé avec succès`);
      setCreateModal(false);
      setCreateForm({ firstName: "", lastName: "", email: "", password: "", role: "adherent" });
      queryClient.invalidateQueries({ queryKey: ["admin-adherents"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const statusCounts = { actif: profiles.filter((p) => p.status === "actif").length, inactif: profiles.filter((p) => p.status === "inactif").length, suspendu: profiles.filter((p) => p.status === "suspendu").length };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Adhérents" breadcrumb={["Administration", "Adhérents"]}>
        {/* Modale création utilisateur */}
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCreateModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Créer un utilisateur</h3>
                <button onClick={() => setCreateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Prénom</Label><Input value={createForm.firstName} onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="Marie" /></div>
                  <div className="space-y-1.5"><Label>Nom</Label><Input value={createForm.lastName} onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Dupont" /></div>
                </div>
                <div className="space-y-1.5"><Label>Email <span className="text-red-500">*</span></Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} placeholder="marie.dupont@example.com" /></div>
                <div className="space-y-1.5"><Label>Mot de passe <span className="text-red-500">*</span></Label><Input type="password" autoComplete="new-password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 caractères" /></div>
                <div className="space-y-1.5"><Label>Rôle initial</Label>
                  <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as UserRole }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roleOptions.map((r) => <SelectItem key={r} value={r}>{roleLabel[r] || r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>Annuler</Button>
                  <Button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Créer l'utilisateur
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "view" ? "Fiche adhérent" : "Modifier l'adhérent"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <Avatar className="h-14 w-14"><AvatarFallback className="bg-red-100 text-red-600 text-lg">{initials(modal.item)}</AvatarFallback></Avatar>
                  <div><p className="text-lg font-bold text-slate-900">{fullName(modal.item)}</p><p className="text-sm text-slate-500">{modal.item.email}</p><div className="mt-2"><RoleBadges roles={modal.item.roles} /></div></div>
                </div>
                {modal.mode === "view" ? (
                  <div className="space-y-3">
                    {[["Téléphone", modal.item.phone || "—"], ["Statut", statusLabel[modal.item.status as MemberStatus] ?? modal.item.status], ["Membre depuis", formatDate(modal.item.created_at)], ["Identifiant", modal.item.id]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 text-sm"><span className="text-slate-500">{k}</span><span className="font-medium text-slate-900 text-right break-all">{v}</span></div>)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5"><Label>Téléphone</Label><Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="06 00 00 00 00" /></div>
                    <div className="space-y-1.5"><Label>Statut</Label><Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as MemberStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="suspendu">Suspendu</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Rôles</Label><div className="grid grid-cols-2 gap-2">{roleOptions.map((role) => {
                      const disabledAdmin = role === "admin" && isLastAdminBeingEdited && editForm.roles.includes("admin" as UserRole);
                      return <label key={role} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${disabledAdmin ? "cursor-not-allowed opacity-60 border-slate-200 bg-slate-50 text-slate-500" : editForm.roles.includes(role) ? "cursor-pointer border-red-200 bg-red-50 text-red-700" : "cursor-pointer border-slate-200 bg-white text-slate-600"}`}><input type="checkbox" checked={editForm.roles.includes(role)} disabled={disabledAdmin} onChange={() => toggleRole(role)} className="h-4 w-4 rounded border-slate-300" />{roleLabel[role] || role}</label>;
                    })}</div><p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">Protection active : le dernier administrateur ne peut pas perdre son rôle Admin. La vérification est faite dans Supabase au moment de l'enregistrement.</p></div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Fermer</Button>
                {modal.mode === "view" && <Button onClick={() => openEdit(modal.item)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Edit className="w-4 h-4" />Modifier</Button>}
                {modal.mode === "edit" && <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-2">{updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Enregistrer</Button>}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {(["actif", "inactif", "suspendu"] as MemberStatus[]).map((s) => <Card key={s} className="border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{statusCounts[s]}</p><p className="text-xs text-slate-500 mt-1">{statusLabel[s]}s</p></CardContent></Card>)}
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{adminCount}</p><p className="text-xs text-slate-500 mt-1">Admins</p></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{representantCount}</p><p className="text-xs text-slate-500 mt-1">Représentants</p></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Users className="w-5 h-5 text-red-600" /></div><div><h2 className="text-lg font-bold text-slate-900">Gestion des Adhérents</h2><p className="text-sm text-slate-500">{profiles.length} membres au total</p></div></div>
          <Button onClick={() => setCreateModal(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2 shrink-0"><UserPlus className="w-4 h-4" />Créer un utilisateur</Button>
        </div>

        <Card className="border-slate-200 shadow-sm mb-6"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Rechercher nom, email ou rôle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedStatus("Tous"); }} className="gap-2"><Filter className="w-4 h-4" />Réinitialiser</Button></div><div className="flex flex-wrap gap-2 mt-3">{(["Tous", "actif", "inactif", "suspendu"] as const).map((s) => <button key={s} onClick={() => setSelectedStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStatus === s ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s === "Tous" ? "Tous" : statusLabel[s]}</button>)}</div></CardContent></Card>

        <Card className="border-slate-200 shadow-sm"><CardContent className="p-0">{isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div> : <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Adhérent", "Email", "Téléphone", "Statut", "Rôles", "Depuis", "Actions"].map((h, i) => <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead><tbody>{filtered.map((p) => <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors"><td className="p-4"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-red-100 text-red-600">{initials(p)}</AvatarFallback></Avatar><span className="font-medium text-slate-900 text-sm">{fullName(p)}</span></div></td><td className="p-4 text-sm text-slate-600">{p.email}</td><td className="p-4 text-sm text-slate-500">{p.phone || "—"}</td><td className="p-4"><Badge className={statusBadgeClass[p.status as MemberStatus] ?? "bg-slate-100 text-slate-600"}>{statusLabel[p.status as MemberStatus] ?? p.status}</Badge></td><td className="p-4"><RoleBadges roles={p.roles} /></td><td className="p-4 text-sm text-slate-500">{formatDate(p.created_at)}</td><td className="p-4"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => openView(p)} title="Voir"><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button><Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button><Button variant="ghost" size="sm" onClick={() => handleResend(p)} disabled={resendMutation.isPending} title="Renvoyer l'email de confirmation d'inscription"><Mail className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(p)} disabled={p.id === currentUserId || deleteMutation.isPending} title={p.id === currentUserId ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun adhérent trouvé</p></div>}</div>}</CardContent></Card>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 flex gap-2"><Shield className="w-4 h-4 text-teal-600 flex-shrink-0" /><p>La gestion des rôles est active. La suppression du dernier rôle Admin est vérifiée directement dans Supabase avant modification.</p></div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
