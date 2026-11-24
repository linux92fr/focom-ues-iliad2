import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { AuthProvider } from "./hooks/useAuth";
import PublicLayout from "./components/PublicLayout";
import { ADMIN_BASE } from "./lib/adminPath";

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
const Actualites = lazy(() => import("./pages/Actualites"));
const ActualiteDetail = lazy(() => import("./pages/ActualiteDetail"));
const NouvelArticle = lazy(() => import("./pages/NouvelArticle"));
const EditArticle = lazy(() => import("./pages/EditArticle"));
const Publications = lazy(() => import("./pages/Publications"));
const PublicationDetail = lazy(() => import("./pages/PublicationDetail"));
const Adhesion = lazy(() => import("./pages/Adhesion"));
const Don = lazy(() => import("./pages/Don"));
const DonMerci = lazy(() => import("./pages/DonMerci"));
const SimulateurMobilite = lazy(() => import("./pages/SimulateurMobilite"));
const SimulateurPrimeVariable = lazy(() => import("./pages/SimulateurPrimeVariable"));
const Elections = lazy(() => import("./pages/Elections"));
const ElectionsPremierTour = lazy(() => import("./pages/ElectionsPremierTour"));
const Nao2026 = lazy(() => import("./pages/nao2026/index"));
const FormulaireNao2026 = lazy(() => import("./pages/nao2026/formulaire/index"));
const AccordGEPP = lazy(() => import("./pages/AccordGEPP"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AI = lazy(() => import("./pages/AI"));
const AssistantJuridique = lazy(() => import("./pages/AssistantJuridique"));
const Legifrance = lazy(() => import("./pages/Legifrance"));
const Judilibre = lazy(() => import("./pages/Judilibre"));
const Permanences = lazy(() => import("./pages/Permanences"));
const Sondages = lazy(() => import("./pages/Sondages"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Profile = lazy(() => import("./pages/Profile"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MesDocuments = lazy(() => import("./pages/MesDocuments"));
const AdminNao2026 = lazy(() => import("./pages/AdminNao2026"));
const AdminParticipation = lazy(() => import("./pages/AdminParticipation"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAI = lazy(() => import("./pages/admin/AdminAI"));
const AdminAssistantIA = lazy(() => import("./pages/admin/AdminAssistantIA"));
const SmartPortal = lazy(() => import("./pages/SmartPortal"));
const AdminAutorisations = lazy(() => import("./pages/admin/AdminAutorisations"));
const AdminSmartUsers = lazy(() => import("./pages/admin/AdminSmartUsers"));
const AdminActualites = lazy(() => import("./pages/admin/AdminActualites"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminAdherents = lazy(() => import("./pages/admin/AdminAdherents"));
const AdminParametres = lazy(() => import("./pages/admin/AdminParametres"));
const AdminBilan = lazy(() => import("./pages/admin/AdminBilan"));
const AdminDroits = lazy(() => import("./pages/admin/AdminDroits"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminHomeEdit = lazy(() => import("./pages/admin/AdminHomeEdit"));
const AdminPermanences = lazy(() => import("./pages/admin/AdminPermanences"));
const AdminPermanenceDemandes = lazy(() => import("./pages/admin/AdminPermanenceDemandes"));
const AdminSondages = lazy(() => import("./pages/admin/AdminSondages"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminReclamations = lazy(() => import("./pages/admin/AdminReclamations"));
const AdminAgenda = lazy(() => import("./pages/admin/AdminAgenda"));
const MesReclamations = lazy(() => import("./pages/MesReclamations"));
const PVSearchPage = lazy(() =>
  import("@/components/PDFSearch").then(module => ({ default: module.PVSearchPage }))
);
const AdminPVDepot = lazy(() => import("./pages/admin/AdminPVDepot"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));
const FormationPortal = lazy(() => import("./formation/FormationPortal"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Chargement">
    <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-primary" />
  </div>
);

function App() {
  if (typeof window !== "undefined" && (window.location.hostname === "formation.focomues-iliad.fr" || new URLSearchParams(window.location.search).get("formation-preview") === "1")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <FormationPortal />
      </Suspense>
    );
  }

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
                      <Route path="/legifrance" element={<Legifrance />} />
                      <Route path="/judilibre" element={<Judilibre />} />
                      <Route path="/permanences" element={<Permanences />} />
                      <Route path="/sondages" element={<Sondages />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/profil" element={<Profile />} />
                      <Route path="/parametres" element={<SettingsPage />} />
                      <Route path="/mes-documents" element={<MesDocuments />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/auth" element={<Navigate to="/" replace />} />
                      <Route path="/mes-reclamations" element={<MesReclamations />} />
                      <Route path={`/${ADMIN_BASE}/nao2026`} element={<AdminNao2026 />} />
                      <Route path={`/${ADMIN_BASE}/participation`} element={<AdminParticipation />} />
                    </Route>

                    <Route path="/smart" element={<SmartPortal />} />
                    <Route path={`/${ADMIN_BASE}/login`} element={<AdminLogin />} />
                    <Route path={`/${ADMIN_BASE}`} element={<AdminDashboard />} />
                    <Route path={`/${ADMIN_BASE}/actualites`} element={<AdminActualites />} />
                    <Route path={`/${ADMIN_BASE}/campagnes`} element={<AdminCampaigns />} />
                    <Route path={`/${ADMIN_BASE}/ai`} element={<AdminAI />} />
                    <Route path={`/${ADMIN_BASE}/assistant-ia`} element={<AdminAssistantIA />} />
                    <Route path={`/${ADMIN_BASE}/autorisations`} element={<AdminAutorisations />} />
                    <Route path={`/${ADMIN_BASE}/utilisateurs-smart`} element={<AdminSmartUsers />} />
                    <Route path={`/${ADMIN_BASE}/actualites/nouveau`} element={<NouvelArticle />} />
                    <Route path={`/${ADMIN_BASE}/actualites/:id/editer`} element={<EditArticle />} />
                    <Route path={`/${ADMIN_BASE}/documents`} element={<AdminDocuments />} />
                    <Route path={`/${ADMIN_BASE}/adherents`} element={<AdminAdherents />} />
                    <Route path={`/${ADMIN_BASE}/parametres`} element={<AdminParametres />} />
                    <Route path={`/${ADMIN_BASE}/bilan`} element={<AdminBilan />} />
                    <Route path={`/${ADMIN_BASE}/droits`} element={<AdminDroits />} />
                    <Route path={`/${ADMIN_BASE}/faq`} element={<AdminFAQ />} />
                    <Route path={`/${ADMIN_BASE}/messages`} element={<AdminMessages />} />
                    <Route path={`/${ADMIN_BASE}/home-edit`} element={<AdminHomeEdit />} />
                    <Route path={`/${ADMIN_BASE}/permanences`} element={<AdminPermanences />} />
                    <Route path={`/${ADMIN_BASE}/permanences-demandes`} element={<AdminPermanenceDemandes />} />
                    <Route path={`/${ADMIN_BASE}/sondages`} element={<AdminSondages />} />
                    <Route path={`/${ADMIN_BASE}/newsletter`} element={<AdminNewsletter />} />
                    <Route path={`/${ADMIN_BASE}/reclamations`} element={<AdminReclamations />} />
                    <Route path={`/${ADMIN_BASE}/agenda`} element={<AdminAgenda />} />
                    <Route path={`/${ADMIN_BASE}/pv`} element={<AdminPVDepot />} />
                    <Route path="/recherche" element={<PVSearchPage />} />
                    <Route path="/recherche-pv" element={<PVSearchPage />} />
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
