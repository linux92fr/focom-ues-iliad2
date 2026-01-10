import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
