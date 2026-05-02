import { useState } from "react";
import { Users, Search, Filter, Plus, Eye, Edit, Trash2, X, Save } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Adherent = {
  id: number; name: string; email: string; phone: string;
  department: string; status: string; joined: string;
};

const initialAdherents: Adherent[] = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@iliad.fr", phone: "06 12 34 56 78", department: "Technique", status: "Actif", joined: "15 mars 2023" },
  { id: 2, name: "Marie Martin", email: "marie.martin@iliad.fr", phone: "06 23 45 67 89", department: "Commercial", status: "Actif", joined: "22 juin 2023" },
  { id: 3, name: "Pierre Bernard", email: "pierre.bernard@iliad.fr", phone: "06 34 56 78 90", department: "RH", status: "Inactif", joined: "10 janv. 2022" },
  { id: 4, name: "Sophie Laurent", email: "sophie.laurent@iliad.fr", phone: "06 45 67 89 01", department: "Finance", status: "Actif", joined: "05 oct. 2023" },
  { id: 5, name: "Michel Thomas", email: "michel.thomas@iliad.fr", phone: "06 56 78 90 12", department: "Technique", status: "Actif", joined: "18 févr. 2024" },
  { id: 6, name: "Catherine Moreau", email: "catherine.moreau@iliad.fr", phone: "06 67 89 01 23", department: "Marketing", status: "Inactif", joined: "30 août 2022" },
];

const departments = ["Tous", "Technique", "Commercial", "RH", "Finance", "Marketing"];
const statuses = ["Tous", "Actif", "Inactif"];

const emptyForm = (): Omit<Adherent, "id"> => ({
  name: "", email: "", phone: "", department: "Technique", status: "Actif", joined: new Date().toLocaleDateString("fr-FR"),
});

type ModalMode = "view" | "edit" | "add";

export default function AdminAdherents() {
  const [adherents, setAdherents] = useState<Adherent[]>(initialAdherents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [modal, setModal] = useState<{ mode: ModalMode; item?: Adherent } | null>(null);
  const [form, setForm] = useState<Omit<Adherent, "id">>(emptyForm());

  const filtered = adherents.filter((a) => {
    const matchDept = selectedDept === "Tous" || a.department === selectedDept;
    const matchStatus = selectedStatus === "Tous" || a.status === selectedStatus;
    const matchSearch = searchQuery === "" || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openView = (item: Adherent) => setModal({ mode: "view", item });
  const openEdit = (item: Adherent) => { setForm({ name: item.name, email: item.email, phone: item.phone, department: item.department, status: item.status, joined: item.joined }); setModal({ mode: "edit", item }); };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Nom et email requis"); return; }
    if (modal?.mode === "add") {
      setAdherents((prev) => [...prev, { ...form, id: Date.now() }]);
      toast.success("Adhérent ajouté");
    } else if (modal?.mode === "edit" && modal.item) {
      setAdherents((prev) => prev.map((a) => a.id === modal.item!.id ? { ...a, ...form } : a));
      toast.success("Adhérent mis à jour");
    }
    setModal(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Supprimer ${name} définitivement ?`)) {
      setAdherents((prev) => prev.filter((a) => a.id !== id));
      toast.success("Adhérent supprimé");
    }
  };

  const setField = (k: keyof Omit<Adherent, "id">, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminAuthGuard>
      <AdminLayout title="Adhérents" breadcrumb={["Administration", "Adhérents"]}>

        {/* ── Modal ──────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {modal.mode === "view" ? "Fiche adhérent" : modal.mode === "edit" ? "Modifier l'adhérent" : "Nouvel adhérent"}
                </h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>

              <div className="p-6 space-y-4">
                {modal.mode === "view" && modal.item ? (
                  <>
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                      <Avatar className="h-14 w-14"><AvatarFallback className="bg-red-100 text-red-600 text-lg">{modal.item.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{modal.item.name}</p>
                        <p className="text-sm text-slate-500">{modal.item.department}</p>
                      </div>
                    </div>
                    {[["Email", modal.item.email], ["Téléphone", modal.item.phone], ["Statut", modal.item.status], ["Adhésion", modal.item.joined]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-900">{v}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Nom complet *</Label>
                        <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Prénom Nom" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email *</Label>
                        <Input value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@iliad.fr" type="email" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Téléphone</Label>
                        <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="06 00 00 00 00" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Département</Label>
                        <Select value={form.department} onValueChange={(v) => setField("department", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["Technique","Commercial","RH","Finance","Marketing"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Statut</Label>
                        <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
                {modal.mode !== "view" && (
                  <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Save className="w-4 h-4" />
                    {modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                  </Button>
                )}
                {modal.mode === "view" && modal.item && (
                  <Button onClick={() => openEdit(modal.item!)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Edit className="w-4 h-4" />Modifier
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Users className="w-5 h-5 text-red-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Adhérents</h2>
              <p className="text-sm text-slate-500">{adherents.length} adhérents au total</p>
            </div>
          </div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Nouvel adhérent
          </Button>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un adhérent..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedDept("Tous"); setSelectedStatus("Tous"); }} className="gap-2">
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {departments.map((dept) => (
                <button key={dept} onClick={() => setSelectedDept(dept)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedDept === dept ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{dept}</button>
              ))}
              {statuses.map((s) => (
                <button key={s} onClick={() => setSelectedStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStatus === s ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s}</button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Table ───────────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Adhérent", "Département", "Statut", "Adhésion", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback className="bg-red-100 text-red-600">{a.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{a.name}</p>
                            <p className="text-xs text-slate-500">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{a.department}</td>
                      <td className="p-4">
                        <Badge className={a.status === "Actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>{a.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{a.joined}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openView(a)} title="Voir"><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id, a.name)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12"><Users className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun adhérent trouvé</p></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
