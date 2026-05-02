import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";

// ── Pages publiques existantes ────────────────────────────────────────────────
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import BilanMandat from "./pages/BilanMandat";
import VosDroits from "./pages/VosDroits";
import DocumentsUtiles from "./pages/DocumentsUtiles";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import RGPD from "./pages/RGPD";

// ── Actualités (CRUD Supabase) ────────────────────────────────────────────────
import Actualites from "./pages/Actualites";
import ActualiteDetail from "./pages/ActualiteDetail";
import NouvelArticle from "./pages/NouvelArticle";
import EditArticle from "./pages/EditArticle";

// ── Adhésion & Don ────────────────────────────────────────────────────────────
import Adhesion from "./pages/Adhesion";
import Don from "./pages/Don";
import DonMerci from "./pages/DonMerci";

// ── Simulateurs ───────────────────────────────────────────────────────────────
import SimulateurMobilite from "./pages/SimulateurMobilite";
import SimulateurPrimeVariable from "./pages/SimulateurPrimeVariable";

// ── Tracts & Élections ────────────────────────────────────────────────────────
import Elections from "./pages/Elections";
import ElectionsPremierTour from "./pages/ElectionsPremierTour";

// ── NAO 2026 & Accords ────────────────────────────────────────────────────────
import Nao2026 from "./pages/nao2026/index";
import FormulaireNao2026 from "./pages/nao2026/formulaire/index";
import AccordGEPP from "./pages/AccordGEPP";

// ── Newsletter & Notifications ────────────────────────────────────────────────
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import Notifications from "./pages/Notifications";

// ── IA ────────────────────────────────────────────────────────────────────────
import AI from "./pages/AI";

// ── Admin (sondages / participation NAO) ──────────────────────────────────────
import AdminNao2026 from "./pages/AdminNao2026";
import AdminParticipation from "./pages/AdminParticipation";
import Sondages from "./pages/Sondages";

// ── Pages admin cible (design conservé à 100%) ────────────────────────────────
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light">
          <SupabaseAuthProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <AdminAuthProvider>
                  <Routes>
                    {/* ── Routes publiques ────────────────────────────── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/bilan-mandat" element={<BilanMandat />} />
                    <Route path="/vos-droits" element={<VosDroits />} />
                    <Route path="/documents-utiles" element={<DocumentsUtiles />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/rgpd" element={<RGPD />} />

                    {/* ── Actualités ──────────────────────────────────── */}
                    <Route path="/actualites" element={<Actualites />} />
                    <Route path="/actualites/:slug" element={<ActualiteDetail />} />

                    {/* ── Adhésion & Don ──────────────────────────────── */}
                    <Route path="/adhesion" element={<Adhesion />} />
                    <Route path="/don" element={<Don />} />
                    <Route path="/don-merci" element={<DonMerci />} />

                    {/* ── Simulateurs ─────────────────────────────────── */}
                    <Route path="/simulateur-mobilite" element={<SimulateurMobilite />} />
                    <Route path="/simulateur-prime-variable" element={<SimulateurPrimeVariable />} />

                    {/* ── Élections ───────────────────────────────────── */}
                    <Route path="/elections" element={<Elections />} />
                    <Route path="/elections/premier-tour" element={<ElectionsPremierTour />} />

                    {/* ── NAO 2026 & Accords ──────────────────────────── */}
                    <Route path="/nao2026" element={<Nao2026 />} />
                    <Route path="/nao2026/formulaire" element={<FormulaireNao2026 />} />
                    <Route path="/accords/gepp" element={<AccordGEPP />} />

                    {/* ── Newsletter & Notifications ──────────────────── */}
                    <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
                    <Route path="/notifications" element={<Notifications />} />

                    {/* ── IA ──────────────────────────────────────────── */}
                    <Route path="/ai" element={<AI />} />

                    {/* ── Sondages / Admin NAO ────────────────────────── */}
                    <Route path="/sondages" element={<Sondages />} />
                    <Route path="/admin/nao2026" element={<AdminNao2026 />} />
                    <Route path="/admin/participation" element={<AdminParticipation />} />

                    {/* ── Admin panel ─────────────────────────────────── */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/actualites" element={<AdminActualites />} />
                    {/* ✅ Routes article création/édition (admin) */}
                    <Route path="/admin/actualites/nouveau" element={<NouvelArticle />} />
                    <Route path="/admin/actualites/:id/editer" element={<EditArticle />} />
                    <Route path="/admin/documents" element={<AdminDocuments />} />
                    <Route path="/admin/adherents" element={<AdminAdherents />} />
                    <Route path="/admin/parametres" element={<AdminParametres />} />
                    <Route path="/admin/bilan" element={<AdminBilan />} />
                    <Route path="/admin/droits" element={<AdminDroits />} />
                    <Route path="/admin/faq" element={<AdminFAQ />} />
                    <Route path="/admin/messages" element={<AdminMessages />} />
                    <Route path="/admin/home-edit" element={<AdminHomeEdit />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdminAuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
