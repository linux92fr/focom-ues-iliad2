import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users, Save, Loader2, Search, Info, LockKeyhole, RotateCcw } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type Access = { can_view: boolean; can_edit: boolean };
type PermissionRow = Access & { role?: string; user_id?: string; section: string; id?: string };
type Member = { id: string; email: string | null; first_name?: string | null; last_name?: string | null; display_name?: string | null; roles: string[] };

const roles = [
  { id: "admin", label: "Administrateur" },
  { id: "redacteur", label: "Rédacteur" },
  { id: "representant", label: "Représentant" },
  { id: "secretaire", label: "Secrétaire" },
  { id: "tresorier", label: "Trésorier" },
  { id: "visio", label: "Visio" },
  { id: "gestionnaire_documents", label: "Gestionnaire de documents" },
  { id: "adherent", label: "Adhérent" },
  { id: "public", label: "Public" },
];
const sections = [
  { id: "dashboard", label: "Tableau de bord", description: "Vue d'ensemble et statistiques" },
  { id: "actualites", label: "Actualités", description: "Créer, modifier et publier des actualités" },
  { id: "studio-ia", label: "Studio IA", description: "Outils de génération par IA" },
  { id: "assistant-ia", label: "Assistant IA", description: "Questions à l'assistant IA" },
  { id: "documents", label: "Documents", description: "Gestion des documents et publications" },
  { id: "adherents", label: "Adhérents", description: "Fiches, comptes et rôles des adhérents" },
  { id: "agenda", label: "Agenda", description: "Événements et permanences" },
  { id: "bilan", label: "Bilan", description: "Bilan de mandat et statistiques" },
  { id: "droits", label: "Droits", description: "Fiches d'information sur les droits des salariés" },
  { id: "faq", label: "FAQ", description: "Questions fréquentes" },
  { id: "messages", label: "Messages", description: "Messages reçus via le site" },
  { id: "home-edit", label: "Édition de l'accueil", description: "Blocs et contenus de la page d'accueil" },
  { id: "sondages", label: "Sondages", description: "Création et gestion des sondages" },
  { id: "newsletter", label: "Newsletter", description: "Abonnés et envois de newsletter" },
  { id: "reclamations", label: "Réclamations", description: "Suivi des réclamations" },
  { id: "parametres", label: "Paramètres", description: "Configuration générale du site" },
];
const emptyAccess = (): Access => ({ can_view: false, can_edit: false });
const memberName = (m: Member) => [m.first_name, m.last_name].filter(Boolean).join(" ") || m.display_name || m.email || m.id;

function AdminOnlyNotice() {
  return <div className="max-w-xl mx-auto mt-16"><Card><CardContent className="p-8 text-center"><LockKeyhole className="w-10 h-10 text-red-600 mx-auto mb-3" /><h2 className="font-bold text-lg">Accès réservé aux administrateurs</h2><p className="text-sm text-slate-500 mt-2">Seuls les administrateurs peuvent consulter ou modifier les autorisations.</p></CardContent></Card></div>;
}

function PermissionsContent() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState("redacteur");
  const [selectedMember, setSelectedMember] = useState("");
  const [search, setSearch] = useState("");
  const [roleDraft, setRoleDraft] = useState<Record<string, Access>>({});
  const [userDraft, setUserDraft] = useState<Record<string, Access>>({});
  const [saving, setSaving] = useState(false);
  const db = supabase as any;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-permissions-settings"],
    queryFn: async () => {
      const [rolesRes, usersRes, profilesRes, userRolesRes] = await Promise.all([
        db.from("admin_role_permissions").select("*"),
        db.from("admin_user_permissions").select("*"),
        db.from("profiles").select("id,email,first_name,last_name,display_name").order("last_name", { ascending: true }),
        db.from("user_roles").select("user_id,role"),
      ]);
      for (const result of [rolesRes, usersRes, profilesRes, userRolesRes]) if (result.error) throw result.error;
      const roleMap = new Map<string, string[]>();
      (userRolesRes.data || []).forEach((r: { user_id: string; role: string }) => roleMap.set(r.user_id, [...(roleMap.get(r.user_id) || []), r.role]));
      const members: Member[] = (profilesRes.data || []).map((p: any) => ({
        ...p, roles: roleMap.get(p.id) || roleMap.get(p.user_id) || [],
      }));
      return {
        roleRows: (rolesRes.data || []) as PermissionRow[],
        userRows: (usersRes.data || []) as PermissionRow[],
        members,
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    const nextRoles: Record<string, Access> = {};
    const nextUsers: Record<string, Access> = {};
    data.roleRows.forEach((r) => { nextRoles[`${r.role}:${r.section}`] = { can_view: r.can_view, can_edit: r.can_edit }; });
    data.userRows.forEach((r) => { nextUsers[`${r.user_id}:${r.section}`] = { can_view: r.can_view, can_edit: r.can_edit }; });
    setRoleDraft(nextRoles);
    setUserDraft(nextUsers);
  }, [data]);

  const filteredMembers = useMemo(() => (data?.members || []).filter((m) => {
    const q = search.toLowerCase().trim();
    return !q || memberName(m).toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q) || m.roles.some((r) => r.includes(q));
  }), [data, search]);

  const updateDraft = (setter: typeof setRoleDraft, key: string, field: keyof Access, value: boolean) => {
    setter((previous) => {
      const current = previous[key] || emptyAccess();
      const next = { ...current, [field]: value };
      if (field === "can_view" && !value) next.can_edit = false;
      if (field === "can_edit" && value) next.can_view = true;
      return { ...previous, [key]: next };
    });
  };

  const saveRole = async () => {
    setSaving(true);
    try {
      const rows = sections.map((section) => ({
        role: selectedRole, section: section.id,
        ...(roleDraft[`${selectedRole}:${section.id}`] || emptyAccess()),
      }));
      const { error: deleteError } = await db.from("admin_role_permissions").delete().eq("role", selectedRole);
      if (deleteError) throw deleteError;
      const { error: insertError } = await db.from("admin_role_permissions").insert(rows);
      if (insertError) throw insertError;
      await queryClient.invalidateQueries({ queryKey: ["admin-permissions-settings"] });
      toast.success("Autorisations du rôle enregistrées.");
    } catch (e) {
      console.error(e); toast.error("Enregistrement impossible. Vérifiez que la migration Supabase est appliquée et que votre compte est administrateur.");
    } finally { setSaving(false); }
  };

  const saveMember = async () => {
    if (!selectedMember) { toast.error("Sélectionnez d'abord un adhérent."); return; }
    setSaving(true);
    try {
      const rows = sections.map((section) => ({
        user_id: selectedMember, section: section.id,
        ...(userDraft[`${selectedMember}:${section.id}`] || emptyAccess()),
      }));
      const { error: deleteError } = await db.from("admin_user_permissions").delete().eq("user_id", selectedMember);
      if (deleteError) throw deleteError;
      const { error: insertError } = await db.from("admin_user_permissions").insert(rows);
      if (insertError) throw insertError;
      await queryClient.invalidateQueries({ queryKey: ["admin-permissions-settings"] });
      toast.success("Autorisations individuelles enregistrées.");
    } catch (e) {
      console.error(e); toast.error("Enregistrement impossible. Vérifiez que la migration Supabase est appliquée et que votre compte est administrateur.");
    } finally { setSaving(false); }
  };

  const resetMember = async () => {
    if (!selectedMember || !window.confirm("Supprimer les exceptions individuelles et revenir aux autorisations du rôle ?")) return;
    const { error: deleteError } = await db.from("admin_user_permissions").delete().eq("user_id", selectedMember);
    if (deleteError) { toast.error("Impossible de réinitialiser les autorisations."); return; }
    await queryClient.invalidateQueries({ queryKey: ["admin-permissions-settings"] });
    toast.success("Exceptions individuelles supprimées.");
  };

  const accessTable = (mode: "role" | "user") => {
    const draft = mode === "role" ? roleDraft : userDraft;
    const prefix = mode === "role" ? selectedRole : selectedMember;
    const setter = mode === "role" ? setRoleDraft : setUserDraft;
    return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="text-left p-3 min-w-48">Rubrique</th><th className="text-left p-3">Description</th><th className="p-3 text-center">Voir</th><th className="p-3 text-center">Modifier</th></tr></thead><tbody>{sections.map((section) => {
      const key = `${prefix}:${section.id}`; const access = draft[key] || emptyAccess();
      return <tr key={section.id} className="border-t border-slate-100"><td className="p-3 font-medium text-slate-800">{section.label}</td><td className="p-3 text-slate-500">{section.description}</td><td className="p-3 text-center"><Checkbox checked={access.can_view} onCheckedChange={(v) => updateDraft(setter, key, "can_view", v === true)} aria-label={`Autoriser la consultation de ${section.label}`} /></td><td className="p-3 text-center"><Checkbox checked={access.can_edit} onCheckedChange={(v) => updateDraft(setter, key, "can_edit", v === true)} disabled={!access.can_view} aria-label={`Autoriser la modification de ${section.label}`} /></td></tr>;
    })}</tbody></table></div>;
  };

  return <AdminLayout title="Gestion des autorisations" breadcrumb={["Administration", "Sécurité", "Autorisations"]}>
    <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div><div className="flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-red-600" /><h2 className="text-xl font-bold text-slate-900">Gestion des autorisations</h2></div><p className="text-sm text-slate-500 mt-2 max-w-3xl">Configurez les droits de consultation et de modification par rôle, puis ajoutez des exceptions pour un adhérent précis. Les changements sont enregistrés dans Supabase.</p></div>
      <Badge variant="outline" className="w-fit">Administrateurs uniquement</Badge>
    </div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 mb-6"><Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" /><p className="text-sm text-amber-900">Cette page enregistre la matrice de permissions. Les contrôles d'accès existants ne sont pas automatiquement remplacés : chaque module devra être raccordé à ces permissions pour que les cases configurées imposent réellement les accès.</p></div>
    {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Impossible de charger les autorisations. Appliquez la migration Supabase avant utilisation.</div>}
    <Tabs defaultValue="roles" className="space-y-4">
      <TabsList><TabsTrigger value="roles">Par rôle</TabsTrigger><TabsTrigger value="members">Par adhérent</TabsTrigger></TabsList>
      <TabsContent value="roles" className="space-y-4">
        <Card><CardHeader><CardTitle className="text-base">Autorisations par rôle</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="max-w-sm space-y-2"><Label>Rôle à configurer</Label><Select value={selectedRole} onValueChange={setSelectedRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent></Select></div>
          {isLoading ? <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div> : accessTable("role")}
          <div className="flex justify-end"><Button onClick={saveRole} disabled={saving || isLoading} className="bg-red-600 hover:bg-red-700 text-white"><Save className="w-4 h-4 mr-2" />Enregistrer ce rôle</Button></div>
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="members" className="space-y-4">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-5 h-5" />Exceptions individuelles</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Rechercher un adhérent</Label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 top-1/2" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, email ou rôle" /></div></div>
            <div className="space-y-2"><Label>Adhérent</Label><Select value={selectedMember} onValueChange={setSelectedMember}><SelectTrigger><SelectValue placeholder="Choisir un adhérent" /></SelectTrigger><SelectContent>{filteredMembers.map((m) => <SelectItem key={m.id} value={m.id}>{memberName(m)}{m.roles.length ? ` — ${m.roles.join(", ")}` : ""}</SelectItem>)}</SelectContent></Select></div>
          </div>
          {!selectedMember ? <div className="py-10 text-center text-sm text-slate-500">Sélectionnez un adhérent pour configurer ses exceptions.</div> : accessTable("user")}
          <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={resetMember} disabled={!selectedMember || saving}><RotateCcw className="w-4 h-4 mr-2" />Revenir aux droits du rôle</Button><Button onClick={saveMember} disabled={!selectedMember || saving || isLoading} className="bg-red-600 hover:bg-red-700 text-white"><Save className="w-4 h-4 mr-2" />Enregistrer cet adhérent</Button></div>
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  </AdminLayout>;
}

export default function AdminAutorisations() {
  const { user } = useAdminAuth();
  if (user?.role !== "admin") return <AdminAuthGuard><AdminLayout title="Gestion des autorisations"><AdminOnlyNotice /></AdminLayout></AdminAuthGuard>;
  return <AdminAuthGuard><PermissionsContent /></AdminAuthGuard>;
}
