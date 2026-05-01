import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Save, ArrowLeft, Bell, Shield, Users, FileText, Mail } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminParametres() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: "FOCOM UES ILIAD",
    siteEmail: "contact@focomues-iliad.fr",
    sitePhone: "01 87 15 43 11",
    maintenanceMode: false,
    newRegistration: true,
    emailNotifications: true,
    defaultTheme: "light",
    itemsPerPage: 10,
    allowContactForm: true,
    showStats: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Paramètres" breadcrumb={["Administration", "Paramètres"]}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Général */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteEmail">Email de contact</Label>
                <Input
                  id="siteEmail"
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleChange("siteEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sitePhone">Téléphone</Label>
                <Input
                  id="sitePhone"
                  value={settings.sitePhone}
                  onChange={(e) => handleChange("sitePhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTheme">Thème par défaut</Label>
                <Select value={settings.defaultTheme} onValueChange={(v) => handleChange("defaultTheme", v)}>
                  <SelectTrigger id="defaultTheme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Fonctionnalités
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Mode maintenance</p>
                    <p className="text-xs text-slate-500">Désactiver l'accès public au site</p>
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(v) => handleChange("maintenanceMode", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Nouvelles inscriptions</p>
                    <p className="text-xs text-slate-500">Autoriser les nouvelles adhésions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.newRegistration}
                  onCheckedChange={(v) => handleChange("newRegistration", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Notifications email</p>
                    <p className="text-xs text-slate-500">Envoyer des notifications par email</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => handleChange("emailNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Formulaire de contact</p>
                    <p className="text-xs text-slate-500">Activer le formulaire de contact public</p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowContactForm}
                  onCheckedChange={(v) => handleChange("allowContactForm", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Afficher les statistiques</p>
                    <p className="text-xs text-slate-500">Afficher les stats sur le dashboard</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showStats}
                  onCheckedChange={(v) => handleChange("showStats", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Affichage */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Affichage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemsPerPage">Éléments par page</Label>
                <Select
                  value={settings.itemsPerPage.toString()}
                  onValueChange={(v) => handleChange("itemsPerPage", parseInt(v))}
                >
                  <SelectTrigger id="itemsPerPage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Enregistré !" : "Enregistrer"}
          </Button>
          <Button variant="outline" className="border-slate-200">
            Réinitialiser
          </Button>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
