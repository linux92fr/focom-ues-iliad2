import { lazy, Suspense } from "react";

// Recharge automatiquement la page si un chunk Vite est introuvable après déploiement
function lazyWithReload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch(() => {
      if (!sessionStorage.getItem("chunk-reload")) {
        sessionStorage.setItem("chunk-reload", "1");
        window.location.reload();
      }
      return new Promise<{ default: T }>(() => {});
    })
  );
}
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { AuthProvider } from "./hooks/useAuth";
import PublicLayout from "./components/PublicLayout";
import { AdminAuthGuard } from "@/components/admin/AdminLayout";
import RequireValidated from "./components/RequireValidated";

// Public pages
const Home = lazyWithReload(() => import("./pages/Home"));
const NotFound = lazyWithReload(() => import("./pages/NotFound"));
const BilanMandat = lazyWithReload(() => import("./pages/BilanMandat"));
const LeSyndicat = lazyWithReload(() => import("./pages/LeSyndicat"));
const VosDroits = lazyWithReload(() => import("./pages/VosDroits"));
const DocumentsUtiles = lazyWithReload(() => import("./pages/DocumentsUtiles"));
const FAQ = lazyWithReload(() => import("./pages/FAQ"));
const Contact = lazyWithReload(() => import("./pages/Contact"));
const MentionsLegales = lazyWithReload(() => import("./pages/MentionsLegales"));
const RGPD = lazyWithReload(() => import("./pages/RGPD"));

// Actualités
const Actualites = lazyWithReload(() => import("./pages/Actualites"));
const ActualiteDetail = lazyWithReload(() => import("./pages/ActualiteDetail"));
const NouvelArticle = lazyWithReload(() => import("./pages/NouvelArticle"));
const EditArticle = lazyWithReload(() => import("./pages/EditArticle"));
const Publications = lazyWithReload(() => import("./pages/Publications"));
const Tracts = lazyWithReload(() => import("./pages/Tracts"));
const FilActualites = lazyWithReload(() => import("./pages/FilActualites"));
const PublicationDetail = lazyWithReload(() => import("./pages/PublicationDetail"));

// Adhésion & dons
const Adhesion = lazyWithReload(() => import("./pages/Adhesion"));
const Don = lazyWithReload(() => import("./pages/Don"));
const DonMerci = lazyWithReload(() => import("./pages/DonMerci"));

// Simulateurs
const SimulateurMobilite = lazyWithReload(() => import("./pages/SimulateurMobilite"));
const SimulateurPrimeVariable = lazyWithReload(() => import("./pages/SimulateurPrimeVariable"));

// Élections & accords
const Elections = lazyWithReload(() => import("./pages/Elections"));
const ElectionsPremierTour = lazyWithReload(() => import("./pages/ElectionsPremierTour"));
const Nao2026 = lazyWithReload(() => import("./pages/nao2026/index"));
const FormulaireNao2026 = lazyWithReload(() => import("./pages/nao2026/formulaire/index"));
const AccordGEPP = lazyWithReload(() => import("./pages/AccordGEPP"));

// Espace membre
const Newsletter = lazyWithReload(() => import("./pages/Newsletter"));
const NewsletterUnsubscribe = lazyWithReload(() => import("./pages/NewsletterUnsubscribe"));
const Notifications = lazyWithReload(() => import("./pages/Notifications"));
const AI = lazyWithReload(() => import("./pages/AI"));
const AssistantJuridique = lazyWithReload(() => import("./pages/AssistantJuridique"));
const Permanences = lazyWithReload(() => import("./pages/Permanences"));
const Sondages = lazyWithReload(() => import("./pages/Sondages"));
const Agenda = lazyWithReload(() => import("./pages/Agenda"));
const Profile = lazyWithReload(() => import("./pages/Profile"));
const MesReclamations = lazyWithReload(() => import("./pages/MesReclamations"));

// Admin — section spécifique
const AdminNao2026 = lazyWithReload(() => import("./pages/AdminNao2026"));
const AdminParticipation = lazyWithReload(() => import("./pages/AdminParticipation"));
const PosterComposer = lazyWithReload(() => import("./components/PosterComposer"));
const AdminLogin = lazyWithReload(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazyWithReload(() => import("./pages/admin/AdminDashboard"));
const AdminActualites = lazyWithReload(() => import("./pages/admin/AdminActualites"));
const AdminDocuments = lazyWithReload(() => import("./pages/admin/AdminDocuments"));
const AdminTracts = lazyWithReload(() => import("./pages/admin/AdminTracts"));
const AdminAdherents = lazyWithReload(() => import("./pages/admin/AdminAdherents"));
const AdminParametres = lazyWithReload(() => import("./pages/admin/AdminParametres"));
const AdminBilan = lazyWithReload(() => import("./pages/admin/AdminBilan"));
const AdminDroits = lazyWithReload(() => import("./pages/admin/AdminDroits"));
const AdminFAQ = lazyWithReload(() => import("./pages/admin/AdminFAQ"));
const AdminMessages = lazyWithReload(() => import("./pages/admin/AdminMessages"));
const AdminHomeEdit = lazyWithReload(() => import("./pages/admin/AdminHomeEdit"));
const AdminPermanences = lazyWithReload(() => import("./pages/admin/AdminPermanences"));
const AdminSondages = lazyWithReload(() => import("./pages/admin/AdminSondages"));
const AdminNewsletter = lazyWithReload(() => import("./pages/admin/AdminNewsletter"));
const AdminReclamations = lazyWithReload(() => import("./pages/admin/AdminReclamations"));
const AdminModerationCommentaires = lazyWithReload(() => import("./pages/admin/AdminModerationCommentaires"));
const AdminAgenda = lazyWithReload(() => import("./pages/admin/AdminAgenda"));
const AdminPodcasts = lazyWithReload(() => import("./pages/admin/AdminPodcasts"));
const Podcasts = lazyWithReload(() => import("./pages/Podcasts"));
const EspaceAdherent = lazyWithReload(() => import("./pages/EspaceAdherent"));
const AuthCallback = lazyWithReload(() => import("./pages/AuthCallback"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light">
          <SupabaseAuthProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <AdminAuthProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route element={<PublicLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/le-syndicat" element={<LeSyndicat />} />
                          <Route path="/bilan-mandat" element={<BilanMandat />} />
                          <Route path="/vos-droits" element={<VosDroits />} />
                          <Route path="/documents-utiles" element={<DocumentsUtiles />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/mentions-legales" element={<MentionsLegales />} />
                          <Route path="/rgpd" element={<RGPD />} />
                          <Route path="/actualites" element={<Actualites />} />
                          <Route path="/actualites/:slug" element={<ActualiteDetail />} />
                          <Route path="/publications" element={<Publications />} />
                          <Route path="/tracts" element={<Tracts />} />
                          <Route path="/publications/:slug" element={<PublicationDetail />} />
                          <Route path="/adhesion" element={<Adhesion />} />
                          <Route path="/don" element={<Don />} />
                          <Route path="/don-merci" element={<DonMerci />} />
                          <Route path="/simulateur-mobilite" element={<SimulateurMobilite />} />
                          <Route path="/simulateur-prime-variable" element={<SimulateurPrimeVariable />} />
                          <Route path="/elections" element={<Elections />} />
                          <Route path="/elections/premier-tour" element={<ElectionsPremierTour />} />
                          <Route path="/nao2026" element={<Nao2026 />} />
                          <Route path="/nao2026/formulaire" element={<FormulaireNao2026 />} />
                          <Route path="/accords/gepp" element={<AccordGEPP />} />
                          <Route path="/newsletter" element={<Newsletter />} />
                          <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
                          <Route path="/notifications" element={<RequireValidated><Notifications /></RequireValidated>} />
                          <Route path="/ai" element={<RequireValidated><AI /></RequireValidated>} />
                          <Route path="/assistant-juridique" element={<RequireValidated><AssistantJuridique /></RequireValidated>} />
                          <Route path="/permanences" element={<RequireValidated><Permanences /></RequireValidated>} />
                          <Route path="/sondages" element={<RequireValidated><Sondages /></RequireValidated>} />
                          <Route path="/agenda" element={<Agenda />} />
                          <Route path="/podcasts" element={<Podcasts />} />
                          <Route path="/profil" element={<RequireValidated><Profile /></RequireValidated>} />
                          <Route path="/espace-adherent" element={<RequireValidated><EspaceAdherent /></RequireValidated>} />
                          <Route path="/mes-reclamations" element={<RequireValidated><MesReclamations /></RequireValidated>} />
                        </Route>

                        <Route path="/admin/nao2026" element={<AdminAuthGuard><AdminNao2026 /></AdminAuthGuard>} />
                        <Route path="/admin/participation" element={<AdminAuthGuard><AdminParticipation /></AdminAuthGuard>} />
                        <Route path="/admin/poster" element={<AdminAuthGuard><PosterComposer /></AdminAuthGuard>} />

                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/actualites" element={<AdminActualites />} />
                        <Route path="/admin/actualites/nouveau" element={<NouvelArticle />} />
                        <Route path="/admin/actualites/:id/editer" element={<EditArticle />} />
                        <Route path="/admin/documents" element={<AdminDocuments />} />
                        <Route path="/admin/tracts" element={<AdminTracts />} />
                        <Route path="/admin/adherents" element={<AdminAdherents />} />
                        <Route path="/admin/parametres" element={<AdminParametres />} />
                        <Route path="/admin/bilan" element={<AdminBilan />} />
                        <Route path="/admin/droits" element={<AdminDroits />} />
                        <Route path="/admin/faq" element={<AdminFAQ />} />
                        <Route path="/admin/messages" element={<AdminMessages />} />
                        <Route path="/admin/home-edit" element={<AdminHomeEdit />} />
                        <Route path="/admin/permanences" element={<AdminPermanences />} />
                        <Route path="/admin/sondages" element={<AdminSondages />} />
                        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                        <Route path="/admin/reclamations" element={<AdminReclamations />} />
                        <Route path="/admin/agenda" element={<AdminAgenda />} />
                        <Route path="/admin/moderation" element={<AdminModerationCommentaires />} />
                        <Route path="/admin/podcasts" element={<AdminPodcasts />} />

                        <Route path="/fil" element={<FilActualites />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AdminAuthProvider>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
