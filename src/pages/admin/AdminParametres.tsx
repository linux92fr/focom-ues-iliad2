import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Save, ArrowLeft, Bell, Shield, Users, FileText, Mail, RotateCcw, Check } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const defaultSettings = {
  siteName: "FOCOM UES ILIAD",
  siteEmail: "contact@focomues-iliad.fr",
  sitePhone: "",
  maintenanceMode: false,
  newRegistration: true,
  emailNotifications: true,
  defaultTheme: "light",
  itemsPerPage: 10,
  allowContactForm: true,
  showStats: true,
};

type Settings = typeof defaultSettings;
type SettingKey = keyof Settings;

export default function AdminParametres() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    // In production: persist to Supabase / localStorage
    setSaved(true);
    toast.success("Paramètres enregistrés avec succès");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setSettings({ ...defaultSettings });
    setConfirmReset(false);
    toast.success("Paramètres réinitialisés aux valeurs par défaut");
  };

  const handleChange = <K extends SettingKey>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  type FeatureItem = {
    key: SettingKey;
    icon: typeof Shield;
    label: string;
    desc: string;
  };

  const features: FeatureItem[] = [
    { key: "maintenanceMode", icon: Shield, label: "Mode maintenance", desc: "Désactiver l'accès public au site" },
    { key: "newRegistration", icon: Users, label: "Nouvelles inscriptions", desc: "Autoriser les nouvelles adhésions" },
    { key: "emailNotifications", icon: Mail, label: "Notifications email", desc: "Envoyer des notifications par email" },
    { key: "allowContactForm", icon: FileText, label: "Formulaire de contact", desc: "Activer le formulaire de contact public" },
    { key: "showStats", icon: Settings, label: "Afficher les statistiques", desc: "Afficher les stats sur le dashboard" },
  ];

  return (
    <AdminAuthGuard>
      <AdminLayout title="Paramètres" breadcrumb={["Administration", "Paramètres"]}>
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Paramètres du site</h2>
            <p className="text-sm text-slate-500">Configuration générale et préférences</p>
          </div>
        </div>

        {/* Maintenance mode warning banner */}
        {settings.maintenanceMode && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Mode maintenance actif</p>
              <p className="text-xs text-amber-600">Le site public est actuellement inaccessible aux visiteurs.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Général ──────────────────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />Général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input id="siteName" value={settings.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteEmail">Email de contact</Label>
                <Input id="siteEmail" type="email" value={settings.siteEmail} onChange={(e) => handleChange("siteEmail", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sitePhone">Téléphone</Label>
                <Input id="sitePhone" value={settings.sitePhone} onChange={(e) => handleChange("sitePhone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTheme">Thème par défaut</Label>
                <Select value={settings.defaultTheme} onValueChange={(v) => handleChange("defaultTheme", v)}>
                  <SelectTrigger id="defaultTheme"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ── Fonctionnalités ───────────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4" />Fonctionnalités
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map(({ key, icon: Icon, label, desc }) => {
                const settingValue = settings[key] as boolean;
                return (
                  <div key={key} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${settingValue && key === "maintenanceMode" ? "bg-amber-50 border border-amber-100" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </div>
                    <Switch checked={settingValue} onCheckedChange={(v) => handleChange(key, v)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ── Affichage ─────────────────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />Affichage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemsPerPage">Éléments par page</Label>
                <Select value={settings.itemsPerPage.toString()} onValueChange={(v) => handleChange("itemsPerPage", parseInt(v))}>
                  <SelectTrigger id="itemsPerPage"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={handleSave} className={`gap-2 transition-colors ${saved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
            {saved ? <><Check className="w-4 h-4" />Enregistré !</> : <><Save className="w-4 h-4" />Enregistrer</>}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className={`gap-2 border-slate-200 transition-colors ${confirmReset ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100" : ""}`}
          >
            <RotateCcw className={`w-4 h-4 ${confirmReset ? "animate-spin" : ""}`} />
            {confirmReset ? "Confirmer la réinitialisation ?" : "Réinitialiser"}
          </Button>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
