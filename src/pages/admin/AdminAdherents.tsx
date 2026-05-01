import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Filter, Plus, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const adherents = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@iliad.fr", phone: "06 12 34 56 78", department: "Technique", status: "Actif", joined: "15 mars 2023" },
  { id: 2, name: "Marie Martin", email: "marie.martin@iliad.fr", phone: "06 23 45 67 89", department: "Commercial", status: "Actif", joined: "22 juin 2023" },
  { id: 3, name: "Pierre Bernard", email: "pierre.bernard@iliad.fr", phone: "06 34 56 78 90", department: "RH", status: "Inactif", joined: "10 janv. 2022" },
  { id: 4, name: "Sophie Laurent", email: "sophie.laurent@iliad.fr", phone: "06 45 67 89 01", department: "Finance", status: "Actif", joined: "05 oct. 2023" },
  { id: 5, name: "Michel Thomas", email: "michel.thomas@iliad.fr", phone: "06 56 78 90 12", department: "Technique", status: "Actif", joined: "18 févr. 2024" },
  { id: 6, name: "Catherine Moreau", email: "catherine.moreau@iliad.fr", phone: "06 67 89 01 23", department: "Marketing", status: "Inactif", joined: "30 août 2022" },
];

const departments = ["Tous", "Technique", "Commercial", "RH", "Finance", "Marketing"];
const statuses = ["Tous", "Actif", "Inactif"];

export default function AdminAdherents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("Tous");

  const filtered = adherents.filter((a) => {
    const matchDept = selectedDept === "Tous" || a.department === selectedDept;
    const matchStatus = selectedStatus === "Tous" || a.status === selectedStatus;
    const matchSearch = searchQuery === "" || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const getStatusColor = (status: string) => {
    return status === "Actif" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600";
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Adhérents" breadcrumb={["Administration", "Adhérents"]}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Adhérents</h2>
              <p className="text-sm text-slate-500">{adherents.length} adhérents au total</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel adhérent
          </Button>
        </div>

        {/* Filters */}
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
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 hidden sm:inline">Filtres :</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Adherents List */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Adhérent</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Département</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Adhésion</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-red-100 text-red-600">{a.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{a.name}</p>
                            <p className="text-xs text-slate-500">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{a.department}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{a.joined}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucun adhérent trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
