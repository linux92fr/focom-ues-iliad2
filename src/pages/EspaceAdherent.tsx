import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, CreditCard, History, CalendarDays,
  Calendar, Clock, MapPin, Video, MessageSquare, AlertCircle,
  CheckCircle2, XCircle, HelpCircle, ChevronRight, ShieldCheck,
  FileText,
} from "lucide-react";
import CarteAdherent from "@/components/CarteAdherent";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: string | null;
  avatar_url: string | null;
  access_key: string | null;
  created_at: string;
}

interface Adhesion {
  id: string;
  type_adhesion: string;
  date_debut: string;
  date_fin: string;
  montant: number | null;
  status: string;
  commentaires: string | null;
  created_at: string;
}

interface RdvWithPermanence {
  id: string;
  permanence_id: string;
  statut: string;
  sujet: string;
  message: string | null;
  note_delegue: string | null;
  created_at: string;
  permanence: {
    titre: string;
    type: string;
    delegue_nom: string;
    date_permanence: string;
    heure_debut: string;
    heure_fin: string;
    lieu: string | null;
    visio_lien: string | null;
  };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const adhesionStatusLabel: Record<string, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
  expiree: "Expirée",
};

const adhesionStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  en_attente: "secondary",
  validee: "default",
  refusee: "destructive",
  expiree: "outline",
};

const rdvStatusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  en_attente: { label: "En attente", icon: HelpCircle, className: "text-amber-600 bg-amber-50 border-amber-200" },
  confirme:   { label: "Confirmé",   icon: CheckCircle2, className: "text-green-600 bg-green-50 border-green-200" },
  annule:     { label: "Annulé",     icon: XCircle,     className: "text-slate-500 bg-slate-50 border-slate-200" },
  effectue:   { label: "Effectué",   icon: CheckCircle2, className: "text-blue-600 bg-blue-50 border-blue-200" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const formatTime = (t: string) => t.slice(0, 5);

const isUpcoming = (rdv: RdvWithPermanence) =>
  new Date(rdv.permanence.date_permanence) >= new Date(new Date().toDateString()) &&
  rdv.statut !== "annule";

// ─── Composant ────────────────────────────────────────────────────────────────

const EspaceAdherent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData as ProfileData);

          const { data: adhesionsData } = await supabase
            .from("adhesions")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false });

          if (adhesionsData) setAdhesions(adhesionsData as Adhesion[]);
        }
      } catch { /* profil inexistant */ }
      finally { setLoading(false); }
    };
    if (user) fetchData();
  }, [user]);

  const { data: mesRdv = [], isLoading: rdvLoading } = useQuery({
    queryKey: ["espace-mes-rdv", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permanence_rdv")
        .select(`
          id, permanence_id, statut, sujet, message, note_delegue, created_at,
          permanence:permanences (
            titre, type, delegue_nom, date_permanence,
            heure_debut, heure_fin, lieu, visio_lien
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RdvWithPermanence[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (rdvId: string) => {
      const { error } = await supabase
        .from("permanence_rdv")
        .update({ statut: "annule" })
        .eq("id", rdvId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["espace-mes-rdv"] });
      toast.success("Rendez-vous annulé");
    },
    onError: () => toast.error("Impossible d'annuler le rendez-vous"),
  });

  const upcomingRdv = mesRdv.filter(isUpcoming);
  const pastRdv = mesRdv.filter((r) => !isUpcoming(r));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const displayName = (profile?.first_name || profile?.last_name)
    ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
    : user.email;

  const initials = ((profile?.first_name?.charAt(0) || "") + (profile?.last_name?.charAt(0) || ""))
    .toUpperCase() || user.email?.substring(0, 2).toUpperCase() || "U";

  const activeAdhesion = adhesions.find((a) => a.status === "validee");
  const nextRdv = upcomingRdv[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-muted/30 py-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Espace Adhérent</h1>
            <p className="text-muted-foreground mt-2">
              Votre carte, vos adhésions et vos rendez-vous avec les délégués FOCOM UES Iliad
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">

            {/* ── Carte résumé latérale ──────────────────────────────────── */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold ring-4 ring-primary/20 mx-auto mb-2">
                  {profile?.avatar_url
                    ? <img loading="lazy" src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                    : initials}
                </div>
                <CardTitle className="text-base">{displayName}</CardTitle>
                <CardDescription className="text-xs">{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Separator />

                {profile?.status && (
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Statut</span>
                    <Badge variant={profile.status === "actif" ? "default" : "secondary"} className="text-[10px]">
                      {profile.status}
                    </Badge>
                  </div>
                )}

                {profile?.created_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}

                {activeAdhesion && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Adhésion active
                      </div>
                      <p className="text-[10px] text-green-600">
                        Jusqu'au {new Date(activeAdhesion.date_fin).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </>
                )}

                {nextRdv && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                        <Calendar className="w-3.5 h-3.5" />
                        Prochain RDV
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium">
                        {new Date(nextRdv.permanence.date_permanence).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" · "}{formatTime(nextRdv.permanence.heure_debut)}
                      </p>
                      <p className="text-[10px] text-blue-500 truncate">{nextRdv.permanence.delegue_nom}</p>
                    </div>
                  </>
                )}

                <Separator />
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" asChild>
                  <Link to="/permanences">
                    <Calendar className="w-3.5 h-3.5" />
                    Prendre RDV
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* ── Onglets ────────────────────────────────────────────────── */}
            <div className="md:col-span-3">
              <Tabs defaultValue="carte" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 overflow-hidden">
                  <TabsTrigger value="carte" className="gap-1.5 text-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ma carte</span>
                  </TabsTrigger>
                  <TabsTrigger value="rdv" className="gap-1.5 text-xs relative">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mes RDV</span>
                    {upcomingRdv.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {upcomingRdv.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="adhesions" className="gap-1.5 text-xs">
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Adhésions</span>
                  </TabsTrigger>
                  <TabsTrigger value="reclamations" className="gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Demandes</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Carte adhérent ─────────────────────────────────────── */}
                <TabsContent value="carte">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Carte adhérent FOCOM
                      </CardTitle>
                      <CardDescription>
                        Votre carte d'adhérent numérique — téléchargeable ou imprimable
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <CarteAdherent
                        firstName={profile?.first_name ?? ""}
                        lastName={profile?.last_name ?? ""}
                        email={user.email || ""}
                        status={profile?.status || "actif"}
                        memberSince={profile?.created_at}
                        accessKey={profile?.access_key}
                        avatarUrl={profile?.avatar_url}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Mes RDV ────────────────────────────────────────────── */}
                <TabsContent value="rdv">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Mes rendez-vous
                      </CardTitle>
                      <CardDescription>
                        Permanences réservées avec les délégués FOCOM
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rdvLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : mesRdv.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Aucun rendez-vous enregistré</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/permanences">
                              <ChevronRight className="w-3.5 h-3.5 mr-1" />
                              Prendre un rendez-vous
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {upcomingRdv.length > 0 && (
                            <section>
                              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                À venir ({upcomingRdv.length})
                              </h3>
                              <div className="space-y-3">
                                {upcomingRdv.map((rdv) => (
                                  <RdvCard
                                    key={rdv.id}
                                    rdv={rdv}
                                    onCancel={() => cancelMutation.mutate(rdv.id)}
                                    cancelling={cancelMutation.isPending}
                                  />
                                ))}
                              </div>
                            </section>
                          )}
                          {pastRdv.length > 0 && (
                            <section>
                              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                Historique ({pastRdv.length})
                              </h3>
                              <div className="space-y-3">
                                {pastRdv.map((rdv) => (
                                  <RdvCard key={rdv.id} rdv={rdv} past />
                                ))}
                              </div>
                            </section>
                          )}
                          <div className="pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to="/permanences">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                Voir toutes les permanences
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Historique adhésions ───────────────────────────────── */}
                <TabsContent value="adhesions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Historique des adhésions
                      </CardTitle>
                      <CardDescription>
                        Suivi de vos adhésions au syndicat FOCOM UES Iliad
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {adhesions.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                            <History className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Aucune adhésion enregistrée</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href="/adhesion">Adhérer à FOCOM</a>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {adhesions.map((adhesion) => (
                            <div
                              key={adhesion.id}
                              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                              <div className="space-y-1 min-w-0">
                                <p className="font-medium text-sm text-foreground capitalize">
                                  {adhesion.type_adhesion}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {new Date(adhesion.date_debut).toLocaleDateString("fr-FR")}
                                  {" → "}
                                  {new Date(adhesion.date_fin).toLocaleDateString("fr-FR")}
                                </p>
                                {adhesion.montant && (
                                  <p className="text-xs text-muted-foreground">
                                    Montant : <span className="font-medium">{adhesion.montant} €</span>
                                  </p>
                                )}
                                {adhesion.commentaires && (
                                  <p className="text-xs text-muted-foreground italic">{adhesion.commentaires}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <Badge variant={adhesionStatusVariant[adhesion.status] || "outline"}>
                                  {adhesionStatusLabel[adhesion.status] || adhesion.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Mes réclamations / demandes ───────────────────────── */}
                <TabsContent value="reclamations">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Mes demandes
                      </CardTitle>
                      <CardDescription>
                        Suivez vos réclamations et demandes d'assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gérez vos réclamations et demandes d'assistance auprès des délégués FOCOM
                        </p>
                        <Button asChild>
                          <Link to="/mes-reclamations">
                            <ChevronRight className="w-4 h-4 mr-1.5" />
                            Accéder à mes demandes
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── Sous-composant : carte RDV ───────────────────────────────────────────────

function RdvCard({
  rdv,
  past = false,
  onCancel,
  cancelling,
}: {
  rdv: RdvWithPermanence;
  past?: boolean;
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const statusCfg = rdvStatusConfig[rdv.statut] ?? rdvStatusConfig.en_attente;
  const StatusIcon = statusCfg.icon;
  const p = rdv.permanence;
  const isVisio = p.type === "visio" || !!p.visio_lien;

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${past ? "bg-muted/20 border-border opacity-75" : "bg-background border-border hover:bg-muted/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{p.titre}</p>
          <p className="text-xs text-muted-foreground">{p.delegue_nom}</p>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${statusCfg.className}`}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{formatDate(p.date_permanence)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatTime(p.heure_debut)} – {formatTime(p.heure_fin)}</span>
        </div>
        {(p.lieu || isVisio) && (
          <div className="flex items-center gap-1.5 col-span-2">
            {isVisio ? <Video className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
            {isVisio && p.visio_lien
              ? <a href={p.visio_lien} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">Rejoindre la visio</a>
              : <span className="truncate">{p.lieu}</span>}
          </div>
        )}
      </div>

      <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span className="italic">{rdv.sujet}</span>
      </div>

      {rdv.note_delegue && (
        <div className="flex items-start gap-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-700 mb-0.5">Note du délégué</p>
            <p className="text-amber-600">{rdv.note_delegue}</p>
          </div>
        </div>
      )}

      {!past && rdv.statut !== "annule" && rdv.statut !== "effectue" && onCancel && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={cancelling}
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
          >
            {cancelling ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
            Annuler ce RDV
          </Button>
        </div>
      )}
    </div>
  );
}

export default EspaceAdherent;
