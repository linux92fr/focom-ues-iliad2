import { useState, useEffect, useRef } from "react";
import { BarChart3, TrendingUp, FileText, Download, Plus, Edit, Trash2, X, Save } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/* ── Fixed AnimatedCounter (was using useState for side effects) ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <div className="text-3xl font-extrabold text-red-600">{count}{suffix}</div>;
}

const stats = [
  { label: "Accords signés", value: 42, suffix: "", icon: FileText, color: "bg-teal-50 text-teal-600" },
  { label: "Réunions CSE", value: 78, suffix: "", icon: BarChart3, color: "bg-red-50 text-red-600" },
  { label: "Dossiers traités", value: 126, suffix: "", icon: FileText, color: "bg-teal-50 text-teal-600" },
  { label: "Taux de participation", value: 100, suffix: "%", icon: TrendingUp, color: "bg-red-50 text-red-600" },
];

const progres = [
  { label: "Pouvoir d'achat", value: 85 },
  { label: "Conditions de travail", value: 90 },
  { label: "Égalité professionnelle", value: 75 },
  { label: "Gestion des emplois", value: 80 },
];

type Bilan = { id: number; title: string; period: string; status: string; downloads: number };

const initialBilans: Bilan[] = [
  { id: 1, title: "Bilan 2022-2023", period: "2022-2023", status: "Publié", downloads: 234 },
  { id: 2, title: "Bilan 2023-2024", period: "2023-2024", status: "Publié", downloads: 567 },
  { id: 3, title: "Bilan 2024-2025", period: "2024-2025", status: "Brouillon", downloads: 0 },
  { id: 4, title: "Bilan 2025-2026", period: "2025-2026", status: "En cours", downloads: 0 },
];

const emptyForm = (): Omit<Bilan, "id" | "downloads"> => ({ title: "", period: "", status: "Brouillon" });

export default function AdminBilan() {
  const [bilans, setBilans] = useState<Bilan[]>(initialBilans);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: Bilan } | null>(null);
  const [form, setForm] = useState<Omit<Bilan, "id" | "downloads">>(emptyForm());

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openEdit = (item: Bilan) => { setForm({ title: item.title, period: item.period, status: item.status }); setModal({ mode: "edit", item }); };

  const handleSave = () => {
    if (!form.title.trim() || !form.period.trim()) { toast.error("Titre et période requis"); return; }
    if (modal?.mode === "add") {
      setBilans((prev) => [...prev, { ...form, id: Date.now(), downloads: 0 }]);
      toast.success("Bilan ajouté");
    } else if (modal?.mode === "edit" && modal.item) {
      setBilans((prev) => prev.map((b) => b.id === modal.item!.id ? { ...b, ...form } : b));
      toast.success("Bilan mis à jour");
    }
    setModal(null);
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Supprimer "${title}" définitivement ?`)) {
      setBilans((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bilan supprimé");
    }
  };

  const handleDownload = (title: string) => {
    toast.success(`Téléchargement de "${title}" démarré`);
  };

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminAuthGuard>
      <AdminLayout title="Bilan de Mandat" breadcrumb={["Administration", "Bilan"]}>

        {/* ── Modal ────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "add" ? "Nouveau bilan" : "Modifier le bilan"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Titre *</Label>
                  <Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Bilan 2025-2026" />
                </div>
                <div className="space-y-1.5">
                  <Label>Période *</Label>
                  <Input value={form.period} onChange={(e) => setField("period", e.target.value)} placeholder="2025-2026" />
                </div>
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Brouillon", "En cours", "Publié"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
                <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Save className="w-4 h-4" />{modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Progress bars ─────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-semibold text-slate-900">Nos avancées principales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {progres.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{p.label}</span>
                  <span className="text-slate-500">{p.value}%</span>
                </div>
                <Progress value={p.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Bilans table ─────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Bilan de mandat</CardTitle>
            <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />Nouveau bilan
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Titre", "Période", "Statut", "Téléchargements", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bilans.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <p className="font-medium text-slate-900 text-sm">{b.title}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{b.period}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === "Publié" ? "bg-green-100 text-green-700" : b.status === "Brouillon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{b.downloads}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(b.title)} title="Télécharger"><Download className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(b)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id, b.title)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
