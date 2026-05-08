import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import {
  Calendar, Clock, MapPin, Users, Video, User, ChevronRight,
  CalendarDays, Loader2, CheckCircle, XCircle,
} from "lucide-react";

interface Permanence {
  id: string;
  delegue_nom: string;
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
}

interface Rdv {
  id: string;
  permanence_id: string;
  statut: string;
}

const typeLabel: Record<string, string> = {
  individuelle: "Rendez-vous individuel",
  collective: "Réunion collective",
};

const statutBadge = (statut: string) => {
  if (statut === "complete") return <Badge variant="destructive">Complet</Badge>;
  if (statut === "annulee") return <Badge variant="outline" className="text-muted-foreground">Annulée</Badge>;
  return <Badge variant="default" className="bg-green-600">Places disponibles</Badge>;
};

export default function Permanences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Permanence | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sujet: "", message: "" });

  // Charger les permanences à venir
  const { data: permanences = [], isLoading } = useQuery({
    queryKey: ["permanences-public"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("permanences")
        .select("*")
        .eq("published", true)
        .neq("statut", "annulee")
        .gte("date_permanence", today)
        .order("date_permanence", { ascending: true });
      if (error) throw error;
      return data as Permanence[];
    },
  });

  // Charger les RDV de l'utilisateur
  const { data: mesRdv = [] } = useQuery({
    queryKey: ["mes-rdv", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permanence_rdv")
        .select("id, permanence_id, statut")
        .eq("user_id", user!.id)
        .neq("statut", "annule");
      if (error) throw error;
      return data as Rdv[];
    },
  });

  const rdvPermanenceIds = new Set(mesRdv.map((r) => r.permanence_id));

  // Mutation : réserver
  const reserverMutation = useMutation({
    mutationFn: async ({
      permanence,
      sujet,
      message,
    }: {
      permanence: Permanence;
      sujet: string;
      message: string;
    }) => {
      if (!user) throw new Error("Connexion requise");
      const { error } = await supabase.from("permanence_rdv").insert({
        permanence_id: permanence.id,
        user_id: user.id,
        user_email: user.email!,
        sujet,
        message: message || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation confirmée ! Vous recevrez un email de confirmation.");
      queryClient.invalidateQueries({ queryKey: ["permanences-public"] });
      queryClient.invalidateQueries({ queryKey: ["mes-rdv"] });
      setShowModal(false);
      setForm({ sujet: "", message: "" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de réserver ce créneau.");
    },
  });

  // Mutation : annuler
  const annulerMutation = useMutation({
    mutationFn: async (permanenceId: string) => {
      const rdv = mesRdv.find((r) => r.permanence_id === permanenceId);
      if (!rdv) return;
      const { error } = await supabase
        .from("permanence_rdv")
        .update({ statut: "annule" })
        .eq("id", rdv.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation annulée.");
      queryClient.invalidateQueries({ queryKey: ["permanences-public"] });
      queryClient.invalidateQueries({ queryKey: ["mes-rdv"] });
    },
    onError: () => {
      toast.error("Impossible d'annuler la réservation.");
    },
  });

  const openReservation = (perm: Permanence) => {
    setSelected(perm);
    setShowModal(true);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatHeure = (h: string) => h.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Permanences syndicales"
        subtitle="Prenez rendez-vous avec un délégué FOCOM pour vos questions individuelles"
        icon={<CalendarDays className="w-6 h-6" />}
      />

      {!user && (
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground">
          <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <p>
            Vous devez être <strong>connecté</strong> pour réserver un créneau de permanence.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : permanences.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Aucune permanence prévue</p>
          <p className="text-sm text-muted-foreground">
            Revenez prochainement ou contactez-nous via le{" "}
            <a href="/contact" className="text-primary hover:underline">formulaire de contact</a>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {permanences.map((perm) => {
            const dejaReserve = rdvPermanenceIds.has(perm.id);
            const placesRestantes = perm.capacite - perm.nb_reservations;

            return (
              <div
                key={perm.id}
                className={`bg-card rounded-2xl border transition-all ${
                  perm.statut === "complete"
                    ? "border-border opacity-75"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {statutBadge(perm.statut)}
                        <Badge variant="outline" className="text-xs">
                          {typeLabel[perm.type] || perm.type}
                        </Badge>
                        {dejaReserve && (
                          <Badge className="bg-blue-600 text-xs gap-1">
                            <CheckCircle className="w-3 h-3" /> Réservé
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{perm.titre}</h3>
                      {perm.description && (
                        <p className="text-sm text-muted-foreground mt-1">{perm.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDate(perm.date_permanence)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatHeure(perm.heure_debut)} – {formatHeure(perm.heure_fin)}</span>
                    </div>
                    {perm.lieu && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{perm.lieu}</span>
                      </div>
                    )}
                    {perm.visio_lien && (
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                        <span className="text-blue-600">Visioconférence</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{perm.delegue_nom}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {perm.statut === "complete"
                          ? "Complet"
                          : `${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                    {dejaReserve ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => annulerMutation.mutate(perm.id)}
                        disabled={annulerMutation.isPending}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Annuler ma réservation
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={perm.statut === "complete" || !user}
                        onClick={() => openReservation(perm)}
                        className="gap-1.5"
                      >
                        Réserver
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de réservation */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réserver un créneau</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  {selected.titre} — {formatDate(selected.date_permanence)},{" "}
                  {formatHeure(selected.heure_debut)}–{formatHeure(selected.heure_fin)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sujet">Sujet de votre demande *</Label>
              <Input
                id="sujet"
                placeholder="Ex : Question sur mon solde de congés"
                value={form.sujet}
                onChange={(e) => setForm((f) => ({ ...f, sujet: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (facultatif)</Label>
              <Textarea
                id="message"
                placeholder="Précisez votre situation si nécessaire…"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                maxLength={1000}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Votre demande restera confidentielle et sera traitée par le délégué FOCOM.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                selected && reserverMutation.mutate({ permanence: selected, ...form })
              }
              disabled={!form.sujet.trim() || reserverMutation.isPending}
            >
              {reserverMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Réservation...</>
              ) : (
                "Confirmer la réservation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
