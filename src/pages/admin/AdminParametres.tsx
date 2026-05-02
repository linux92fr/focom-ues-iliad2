import { Settings, Save, Globe, Bell, Lock, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

export default function AdminParametres() {
  return (
    <AdminAuthGuard>
      <AdminLayout title="Paramètres" breadcrumb={["Administration", "Paramètres"]}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Paramètres du site</h2>
            <p className="text-sm text-slate-500">Configuration générale</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nom du syndicat</label>
                  <Input defaultValue="FOCOM UES ILIAD" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email de contact</label>
                  <Input defaultValue="contact@focom-ues-iliad.fr" type="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description du site</label>
                <Input defaultValue="Syndicat FOCOM — UES ILIAD" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">URL du site</label>
                <Input defaultValue="https://focom-ues-iliad.fr" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Nouveaux messages de contact", description: "Recevoir un email à chaque nouveau message" },
                { label: "Nouveaux formulaires d'adhésion", description: "Recevoir un email à chaque nouvelle adhésion" },
                { label: "Rappels élections", description: "Recevoir des rappels avant les échéances électorales" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apparence */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Rouge", color: "bg-red-600", active: true },
                  { label: "Teal", color: "bg-teal-600", active: false },
                  { label: "Bleu", color: "bg-blue-600", active: false },
                  { label: "Ardoise", color: "bg-slate-700", active: false },
                ].map((theme) => (
                  <button
                    key={theme.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      theme.active
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${theme.color}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
