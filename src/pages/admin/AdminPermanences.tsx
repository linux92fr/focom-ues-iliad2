import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Eye, Users, CalendarDays, Clock,
  CheckCircle, XCircle, Loader2,
} from "lucide-react";

interface Permanence {
  id: string;
  delegue_nom: string;
  delegue_email: string | null;
  type: string;
  titre: string;
  description: string | null;
  date_permanence: string;
  heure_debut: string;
  heure_fin: string;
  lieu: string | null;
  visio_lien: string | null;
  capacite: number;
  nb_reservations: number;
  statut: string;
  published: boolean;
}

interface Rdv {
  id: string;
  user_email: string;
  user_nom: string | null;
  sujet: string;
  message: string | null;
  statut: string;
  note_delegue: string | null;
  created_at: string;
}

const emptyForm = (): Partial<Permanence> => ({
  delegue_nom: "",
  delegue_email: "",
  type: "individuelle",
  titre: "",
  description: "",
  date_permanence: "",
  heure_debut: "",
  heure_fin: "",
  lieu: "",
  visio_lien: "",
  capacite: 1,
  published: true,
});

const rdvStatutLabel: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  annule: "Annulé",
  effectue: "Effectué",
};

const rdvStatutVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  en_attente: "secondary",
  confirme: "default",
  annule: "destructive",
  effectue: "outline",
};

export default function AdminPermanences() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<
    | { mode: "create" }
    | { mode: "edit"; item: Permanence }
    | { mode: "rdv"; item: Permanence }
    | null
  >(null);
  const [formData, setFormData] = useState<Partial<Permanence>>(emptyForm());
  const [rdvFilter, setRdvFilter] = useState("tous");

  const { data: permanences = [], isLoading } = useQuery({
    queryKey: ["admin-permanences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permanences")
        .select("*")
        .order("date_permanence", { ascending: false });
      if (error) throw error;
      return data as Permanence[];
    },
  });

  const { data: rdvs = [] } = useQuery({
    queryKey: ["admin-rdv", modal?.mode === "rdv" ? (modal as { mode: "rdv"; item: Permanence }).item.id : null],
    enabled: modal?.mode === "rdv",
    queryFn: async () => {
      const permanenceId = (modal as { mode: "rdv"; item: Permanence }).item.id;
      const { data, error } = await supabase
        .from("permanence_rdv")
        .select("*")
        .eq("permanence_id", permanenceId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Rdv[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Permanence>) => {
      if (modal?.mode === "edit") {
        const { error } = await supabase
          .from("permanences")
          .update(data)
          .eq("id", (modal as { mode: "edit"; item: Permanence }).item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("permanences").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(modal?.mode === "edit" ? "Permanence mise à jour" : "Permanence créée");
      queryClient.invalidateQueries({ queryKey: ["admin-permanences"] });
      setModal(null);
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("permanences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Permanence supprimée");
      queryClient.invalidateQueries({ queryKey: ["admin-permanences"] });
    },
    onError: () => toast.error("Impossible de supprimer"),
  });

  const updateRdvStatut = useMutation({
    mutationFn: async ({ rdvId, statut }: { rdvId: string; statut: string }) => {
      const { error } = await supabase
        .from("permanence_rdv")
        .update({ statut })
        .eq("id", rdvId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-rdv"] });
      queryClient.invalidateQueries({ queryKey: ["admin-permanences"] });
    },
  });

  const openCreate = () => {
    setFormData(emptyForm());
    setModal({ mode: "create" });
  };

  const openEdit = (item: Permanence) => {
    setFormData({ ...item });
    setModal({ mode: "edit", item });
  };

  const handleSave = () => {
    if (!formData.titre || !formData.date_permanence || !formData.heure_debut || !formData.heure_fin || !formData.delegue_nom) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredRdvs = rdvs.filter(r => rdvFilter === "tous" || r.statut === rdvFilter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

  return (
    <AdminAuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Permanences</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez les créneaux de permanence et les réservations</p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle permanence
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total", value: permanences.length, icon: CalendarDays },
              { label: "À venir", value: permanences.filter(p => new Date(p.date_permanence) >= new Date() && p.statut !== "annulee").length, icon: Clock },
              { label: "Réservations", value: permanences.reduce((s, p) => s + p.nb_reservations, 0), icon: Users },
              { label: "Complètes", value: permanences.filter(p => p.statut === "complete").length, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste des permanences */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {permanences.map((perm) => (
                <Card key={perm.id} className={perm.statut === "annulee" ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={perm.statut === "ouverte" ? "default" : perm.statut === "complete" ? "destructive" : "outline"}>
                            {perm.statut}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{perm.type}</Badge>
                          {!perm.published && <Badge variant="secondary">Brouillon</Badge>}
                        </div>
                        <h3 className="font-semibold text-sm">{perm.titre}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(perm.date_permanence)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{perm.heure_debut.slice(0,5)}–{perm.heure_fin.slice(0,5)}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{perm.nb_reservations}/{perm.capacite}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Délégué : {perm.delegue_nom}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => setModal({ mode: "rdv", item: perm })}
                          title="Voir les réservations"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => openEdit(perm)}
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Supprimer cette permanence ?")) deleteMutation.mutate(perm.id);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal créer/éditer */}
        <Dialog open={modal?.mode === "create" || modal?.mode === "edit"} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modal?.mode === "edit" ? "Modifier la permanence" : "Nouvelle permanence"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Délégué *</Label>
                  <Input value={formData.delegue_nom || ""} onChange={e => setFormData(f => ({ ...f, delegue_nom: e.target.value }))} placeholder="Nom du délégué" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email délégué</Label>
                  <Input type="email" value={formData.delegue_email || ""} onChange={e => setFormData(f => ({ ...f, delegue_email: e.target.value }))} placeholder="email@focom.fr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Titre *</Label>
                <Input value={formData.titre || ""} onChange={e => setFormData(f => ({ ...f, titre: e.target.value }))} placeholder="Ex : Permanence droits du travail" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={formData.type || "individuelle"} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individuelle">Individuelle</SelectItem>
                      <SelectItem value="collective">Collective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Capacité *</Label>
                  <Input type="number" min={1} value={formData.capacite || 1} onChange={e => setFormData(f => ({ ...f, capacite: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date_permanence || ""} onChange={e => setFormData(f => ({ ...f, date_permanence: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Début *</Label>
                  <Input type="time" value={formData.heure_debut || ""} onChange={e => setFormData(f => ({ ...f, heure_debut: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fin *</Label>
                  <Input type="time" value={formData.heure_fin || ""} onChange={e => setFormData(f => ({ ...f, heure_fin: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Lieu</Label>
                <Input value={formData.lieu || ""} onChange={e => setFormData(f => ({ ...f, lieu: e.target.value }))} placeholder="Ex : Salle B12, bâtiment principal" />
              </div>

              <div className="space-y-1.5">
                <Label>Lien visioconférence</Label>
                <Input value={formData.visio_lien || ""} onChange={e => setFormData(f => ({ ...f, visio_lien: e.target.value }))} placeholder="https://meet.google.com/..." />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={formData.description || ""} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Informations complémentaires…" rows={2} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="published"
                  checked={formData.published ?? true}
                  onChange={e => setFormData(f => ({ ...f, published: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="published">Publier (visible sur le site)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {modal?.mode === "edit" ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal réservations */}
        <Dialog open={modal?.mode === "rdv"} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Réservations — {modal?.mode === "rdv" ? (modal as { mode: "rdv"; item: Permanence }).item.titre : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {/* Filtre */}
              <div className="flex gap-2 flex-wrap">
                {["tous", "en_attente", "confirme", "effectue", "annule"].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={rdvFilter === s ? "default" : "outline"}
                    onClick={() => setRdvFilter(s)}
                    className="text-xs h-7"
                  >
                    {s === "tous" ? "Tous" : rdvStatutLabel[s]}
                  </Button>
                ))}
              </div>

              {filteredRdvs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Aucune réservation</p>
              ) : (
                filteredRdvs.map((rdv) => (
                  <Card key={rdv.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={rdvStatutVariant[rdv.statut] || "outline"} className="text-xs">
                              {rdvStatutLabel[rdv.statut] || rdv.statut}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rdv.user_nom || rdv.user_email}</span>
                          </div>
                          <p className="text-sm font-medium">{rdv.sujet}</p>
                          {rdv.message && <p className="text-xs text-muted-foreground mt-1">{rdv.message}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(rdv.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {rdv.statut === "en_attente" && (
                            <>
                              <Button
                                size="icon" variant="ghost" className="h-7 w-7 text-green-600"
                                onClick={() => updateRdvStatut.mutate({ rdvId: rdv.id, statut: "confirme" })}
                                title="Confirmer"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                                onClick={() => updateRdvStatut.mutate({ rdvId: rdv.id, statut: "annule" })}
                                title="Annuler"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {rdv.statut === "confirme" && (
                            <Button
                              size="icon" variant="ghost" className="h-7 w-7 text-primary"
                              onClick={() => updateRdvStatut.mutate({ rdvId: rdv.id, statut: "effectue" })}
                              title="Marquer effectué"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
