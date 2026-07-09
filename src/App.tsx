import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { AuthProvider } from "./hooks/useAuth";
import PublicLayout from "./components/PublicLayout";
import PosterComposer from "./components/PosterComposer";
import { ADMIN_BASE } from "./lib/adminPath";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import BilanMandat from "./pages/BilanMandat";
import LeSyndicat from "./pages/LeSyndicat";
import VosDroits from "./pages/VosDroits";
import DocumentsUtiles from "./pages/DocumentsUtiles";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import RGPD from "./pages/RGPD";

import Actualites from "./pages/Actualites";
import ActualiteDetail from "./pages/ActualiteDetail";
import NouvelArticle from "./pages/NouvelArticle";
import EditArticle from "./pages/EditArticle";
import Publications from "./pages/Publications";
import PublicationDetail from "./pages/PublicationDetail";

import Adhesion from "./pages/Adhesion";
import Don from "./pages/Don";
import DonMerci from "./pages/DonMerci";

import SimulateurMobilite from "./pages/SimulateurMobilite";
import SimulateurPrimeVariable from "./pages/SimulateurPrimeVariable";

import Elections from "./pages/Elections";
import ElectionsPremierTour from "./pages/ElectionsPremierTour";

import Nao2026 from "./pages/nao2026/index";
import FormulaireNao2026 from "./pages/nao2026/formulaire/index";
import AccordGEPP from "./pages/AccordGEPP";

import Newsletter from "./pages/Newsletter";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import Notifications from "./pages/Notifications";

import AI from "./pages/AI";
import AssistantJuridique from "./pages/AssistantJuridique";
import Permanences from "./pages/Permanences";
import Sondages from "./pages/Sondages";
import Agenda from "./pages/Agenda";
import Profile from "./pages/Profile";

import AdminNao2026 from "./pages/AdminNao2026";
import AdminParticipation from "./pages/AdminParticipation";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminActualites from "./pages/admin/AdminActualites";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminAdherents from "./pages/admin/AdminAdherents";
import AdminParametres from "./pages/admin/AdminParametres";
import AdminBilan from "./pages/admin/AdminBilan";
import AdminDroits from "./pages/admin/AdminDroits";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminHomeEdit from "./pages/admin/AdminHomeEdit";
import AdminPermanences from "./pages/admin/AdminPermanences";
import AdminSondages from "./pages/admin/AdminSondages";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminReclamations from "./pages/admin/AdminReclamations";
import AdminAgenda from "./pages/admin/AdminAgenda";
import MesReclamations from "./pages/MesReclamations";
import { PVSearchPage } from "@/components/PDFSearch";
import AdminPVDepot from "./pages/admin/AdminPVDepot";

const queryClient = new QueryClient();

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
                      <Route path="/permanences" element={<Permanences />} />
                      <Route path="/sondages" element={<Sondages />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/profil" element={<Profile />} />
                      <Route path="/mes-reclamations" element={<MesReclamations />} />
                      <Route path={`/${ADMIN_BASE}/nao2026`} element={<AdminNao2026 />} />
                      <Route path={`/${ADMIN_BASE}/participation`} element={<AdminParticipation />} />
                      <Route path={`/${ADMIN_BASE}/poster`} element={<PosterComposer />} />
                    </Route>

                    <Route path={`/${ADMIN_BASE}/login`} element={<AdminLogin />} />
                    <Route path={`/${ADMIN_BASE}`} element={<AdminDashboard />} />
                    <Route path={`/${ADMIN_BASE}/actualites`} element={<AdminActualites />} />
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
                    <Route path={`/${ADMIN_BASE}/sondages`} element={<AdminSondages />} />
                    <Route path={`/${ADMIN_BASE}/newsletter`} element={<AdminNewsletter />} />
                    <Route path={`/${ADMIN_BASE}/reclamations`} element={<AdminReclamations />} />
                    <Route path={`/${ADMIN_BASE}/agenda`} element={<AdminAgenda />} />
                    <Route path={`/${ADMIN_BASE}/pv`} element={<AdminPVDepot />} />
                    <Route path="/recherche" element={<PVSearchPage />} />
                    <Route path="/recherche-pv" element={<PVSearchPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
