import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Home";
import IntroSplash from "./components/IntroSplash";
import Agenda from "./pages/Agenda";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Actualites from "./pages/Actualites";
import ActualiteDetail from "./pages/ActualiteDetail";
import Publications from "./pages/Publications";
import PublicationDetail from "./pages/PublicationDetail";
import VosDroits from "./pages/VosDroits";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import NotFound from "./pages/NotFound";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <IntroSplash />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/parametres" element={<Settings />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/actualite/:id" element={<ActualiteDetail />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/publication/:slug" element={<PublicationDetail />} />
              <Route path="/vos-droits" element={<VosDroits />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/actualites" element={<AdminActualites />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
