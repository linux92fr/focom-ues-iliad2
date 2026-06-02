import { lazy, Suspense } from "react";
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

// Public pages
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BilanMandat = lazy(() => import("./pages/BilanMandat"));
const LeSyndicat = lazy(() => import("./pages/LeSyndicat"));
const VosDroits = lazy(() => import("./pages/VosDroits"));
const DocumentsUtiles = lazy(() => import("./pages/DocumentsUtiles"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const RGPD = lazy(() => import("./pages/RGPD"));

// Actualités
const Actualites = lazy(() => import("./pages/Actualites"));
const ActualiteDetail = lazy(() => import("./pages/ActualiteDetail"));
const NouvelArticle = lazy(() => import("./pages/NouvelArticle"));
const EditArticle = lazy(() => import("./pages/EditArticle"));
const Publications = lazy(() => import("./pages/Publications"));
const Tracts = lazy(() => import("./pages/Tracts"));
const FilActualites = lazy(() => import("./pages/FilActualites"));
const PublicationDetail = lazy(() => import("./pages/PublicationDetail"));

// Adhésion & dons
const Adhesion = lazy(() => import("./pages/Adhesion"));
const Don = lazy(() => import("./pages/Don"));
const DonMerci = lazy(() => import("./pages/DonMerci"));

// Simulateurs
const SimulateurMobilite = lazy(() => import("./pages/SimulateurMobilite"));
const SimulateurPrimeVariable = lazy(() => import("./pages/SimulateurPrimeVariable"));

// Élections & accords
const Elections = lazy(() => import("./pages/Elections"));
const ElectionsPremierTour = lazy(() => import("./pages/ElectionsPremierTour"));
const Nao2026 = lazy(() => import("./pages/nao2026/index"));
const FormulaireNao2026 = lazy(() => import("./pages/nao2026/formulaire/index"));
const AccordGEPP = lazy(() => import("./pages/AccordGEPP"));

// Espace membre
const Newsletter = lazy(() => import("./pages/Newsletter"));
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AI = lazy(() => import("./pages/AI"));
const AssistantJuridique = lazy(() => import("./pages/AssistantJuridique"));
const Permanences = lazy(() => import("./pages/Permanences"));
const Sondages = lazy(() => import("./pages/Sondages"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Profile = lazy(() => import("./pages/Profile"));
const MesReclamations = lazy(() => import("./pages/MesReclamations"));

// Admin — section spécifique
const AdminNao2026 = lazy(() => import("./pages/AdminNao2026"));
const AdminParticipation = lazy(() => import("./pages/AdminParticipation"));
const PosterComposer = lazy(() => import("./components/PosterComposer"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminActualites = lazy(() => import("./pages/admin/AdminActualites"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminTracts = lazy(() => import("./pages/admin/AdminTracts"));
const AdminAdherents = lazy(() => import("./pages/admin/AdminAdherents"));
const AdminParametres = lazy(() => import("./pages/admin/AdminParametres"));
const AdminBilan = lazy(() => import("./pages/admin/AdminBilan"));
const AdminDroits = lazy(() => import("./pages/admin/AdminDroits"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminHomeEdit = lazy(() => import("./pages/admin/AdminHomeEdit"));
const AdminPermanences = lazy(() => import("./pages/admin/AdminPermanences"));
const AdminSondages = lazy(() => import("./pages/admin/AdminSondages"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminReclamations = lazy(() => import("./pages/admin/AdminReclamations"));
const AdminAgenda = lazy(() => import("./pages/admin/AdminAgenda"));
const EspaceAdherent = lazy(() => import("./pages/EspaceAdherent"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

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
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/ai" element={<AI />} />
                          <Route path="/assistant-juridique" element={<AssistantJuridique />} />
                          <Route path="/permanences" element={<Permanences />} />
                          <Route path="/sondages" element={<Sondages />} />
                          <Route path="/agenda" element={<Agenda />} />
                          <Route path="/profil" element={<Profile />} />
                          <Route path="/espace-adherent" element={<EspaceAdherent />} />
                          <Route path="/mes-reclamations" element={<MesReclamations />} />
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
