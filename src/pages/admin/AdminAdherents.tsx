import { Users, Search, Filter, UserPlus, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

const adherents = [
  {
    id: 1,
    nom: "Martin",
    prenom: "Sophie",
    email: "s.martin@example.com",
    telephone: "06 12 34 56 78",
    service: "RH",
    statut: "Actif",
    depuis: "Jan. 2023",
  },
  {
    id: 2,
    nom: "Dupont",
    prenom: "Jean",
    email: "j.dupont@example.com",
    telephone: "06 23 45 67 89",
    service: "Informatique",
    statut: "Actif",
    depuis: "Mar. 2022",
  },
  {
    id: 3,
    nom: "Bernard",
    prenom: "Claire",
    email: "c.bernard@example.com",
    telephone: "06 34 56 78 90",
    service: "Finance",
    statut: "Inactif",
    depuis: "Sep. 2021",
  },
  {
    id: 4,
    nom: "Leroy",
    prenom: "Thomas",
    email: "t.leroy@example.com",
    telephone: "06 45 67 89 01",
    service: "Commercial",
    statut: "Actif",
    depuis: "Juin 2024",
  },
  {
    id: 5,
    nom: "Moreau",
    prenom: "Isabelle",
    email: "i.moreau@example.com",
    telephone: "06 56 78 90 12",
    service: "Production",
    statut: "Actif",
    depuis: "Nov. 2023",
  },
];

const statutColor: Record<string, string> = {
  Actif: "bg-green-100 text-green-700",
  Inactif: "bg-slate-100 text-slate-500",
};

function getInitials(prenom: string, nom: string) {
  return `${prenom[0]}${nom[0]}`.toUpperCase();
}

const avatarColors = [
  "bg-red-100 text-red-700",
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
];

export default function AdminAdherents() {
  const actifs = adherents.filter((a) => a.statut === "Actif").length;

  return (
    <AdminAuthGuard>
      <AdminLayout title="Adhérents" breadcrumb={["Administration", "Adhérents"]}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des adhérents</h2>
              <p className="text-sm text-slate-500">
                {adherents.length} adhérent{adherents.length > 1 ? "s" : ""} — {actifs} actif{actifs > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button className="bg-slate-700 hover:bg-slate-800 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel adhérent
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un adhérent..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Adherents list */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Liste des adhérents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adherents.map((adherent, idx) => (
                <div
                  key={adherent.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                      {getInitials(adherent.prenom, adherent.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {adherent.prenom} {adherent.nom}
                      </p>
                      <p className="text-xs text-slate-400">{adherent.service} · Depuis {adherent.depuis}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 mx-4">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {adherent.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {adherent.telephone}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statutColor[adherent.statut]}`}>
                    {adherent.statut}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
