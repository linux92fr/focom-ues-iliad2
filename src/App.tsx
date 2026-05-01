import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import Home from "./pages/Home";
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
import Actualites from "./pages/Actualites";
import BilanMandat from "./pages/BilanMandat";
import VosDroits from "./pages/VosDroits";
import DocumentsUtiles from "./pages/DocumentsUtiles";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import RGPD from "./pages/RGPD";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AdminAuthProvider>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/actualites" element={<Actualites />} />
                <Route path="/bilan-mandat" element={<BilanMandat />} />
                <Route path="/vos-droits" element={<VosDroits />} />
                <Route path="/documents-utiles" element={<DocumentsUtiles />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/rgpd" element={<RGPD />} />

                {/* Routes admin */}
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
            </AdminAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
