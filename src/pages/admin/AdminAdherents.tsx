import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Filter, Eye, Edit, X, Save, Loader2 } from "lucide-react";
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
type MemberStatus = "actif" | "inactif" | "suspendu";

type ModalMode = "view" | "edit";

const statusLabel: Record<MemberStatus, string> = {
  actif: "Actif",
  inactif: "Inactif",
  suspendu: "Suspendu",
};

const statusBadgeClass: Record<MemberStatus, string> = {
  actif: "bg-green-100 text-green-700",
  inactif: "bg-slate-100 text-slate-600",
  suspendu: "bg-red-100 text-red-600",
};

const initials = (p: Profile) =>
  `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase();

const fullName = (p: Profile) => `${p.first_name} ${p.last_name}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function AdminAdherents() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"Tous" | MemberStatus>("Tous");
  const [modal, setModal] = useState<{ mode: ModalMode; item: Profile } | null>(null);
  const [editForm, setEditForm] = useState<{ phone: string; status: MemberStatus }>({ phone: "", status: "actif" });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-adherents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("last_name", { ascending: true });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-adherents"] });
      toast.success("Adhérent mis à jour");
      setModal(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const filtered = profiles.filter((p) => {
    const matchStatus = selectedStatus === "Tous" || p.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openView = (item: Profile) => setModal({ mode: "view", item });

  const openEdit = (item: Profile) => {
    setEditForm({ phone: item.phone ?? "", status: item.status as MemberStatus });
    setModal({ mode: "edit", item });
  };

  const handleSave = () => {
    if (!modal) return;
    updateMutation.mutate({
      id: modal.item.id,
      updates: { phone: editForm.phone || null, status: editForm.status },
    });
  };

  const statusCounts = {
    actif: profiles.filter((p) => p.status === "actif").length,
    inactif: profiles.filter((p) => p.status === "inactif").length,
    suspendu: profiles.filter((p) => p.status === "suspendu").length,
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Adhérents" breadcrumb={["Administration", "Adhérents"]}>

        {/* ── Modal ──────────────────────────────────────────── */}
        {modal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {modal.mode === "view" ? "Fiche adhérent" : "Modifier l'adhérent"}
                </h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-red-100 text-red-600 text-lg">
                      {initials(modal.item)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{fullName(modal.item)}</p>
                    <p className="text-sm text-slate-500">{modal.item.email}</p>
                  </div>
                </div>

                {modal.mode === "view" ? (
                  <div className="space-y-3">
                    {[
                      ["Téléphone", modal.item.phone || "—"],
                      ["Statut", statusLabel[modal.item.status as MemberStatus] ?? modal.item.status],
                      ["Membre depuis", formatDate(modal.item.created_at)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Téléphone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="06 00 00 00 00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Statut</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as MemberStatus }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                          <SelectItem value="suspendu">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Fermer</Button>
                {modal.mode === "view" && (
                  <Button onClick={() => openEdit(modal.item)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Edit className="w-4 h-4" />Modifier
                  </Button>
                )}
                {modal.mode === "edit" && (
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(["actif", "inactif", "suspendu"] as MemberStatus[]).map((s) => (
            <Card key={s} className="border-slate-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{statusCounts[s]}</p>
                <p className="text-xs text-slate-500 mt-1">{statusLabel[s]}s</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Adhérents</h2>
              <p className="text-sm text-slate-500">{profiles.length} membres au total</p>
            </div>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un adhérent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(""); setSelectedStatus("Tous"); }}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(["Tous", "actif", "inactif", "suspendu"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === s
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "Tous" ? "Tous" : statusLabel[s]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Table ───────────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["Adhérent", "Email", "Téléphone", "Statut", "Depuis", "Actions"].map((h, i) => (
                        <th
                          key={h}
                          className={`p-4 text-sm font-semibold text-slate-600 ${i === 5 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-red-100 text-red-600">{initials(p)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 text-sm">{fullName(p)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{p.email}</td>
                        <td className="p-4 text-sm text-slate-500">{p.phone || "—"}</td>
                        <td className="p-4">
                          <Badge className={statusBadgeClass[p.status as MemberStatus] ?? "bg-slate-100 text-slate-600"}>
                            {statusLabel[p.status as MemberStatus] ?? p.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-500">{formatDate(p.created_at)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openView(p)} title="Voir">
                              <Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Modifier">
                              <Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Aucun adhérent trouvé</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
