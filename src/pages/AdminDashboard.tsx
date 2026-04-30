import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, Home, LayoutTemplate, Lock, Newspaper, Shield, Users } from "lucide-react";
import ArticlesManager from "@/components/admin/ArticlesManager";
import NewsManager from "@/components/admin/NewsManager";
import UsersManager from "@/components/admin/UsersManager";
import EventsManager from "@/components/admin/EventsManager";
import AuthModal from "@/components/AuthModal";
import SiteContentManager from "@/components/admin/SiteContentManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isContentEditor, loading: roleLoading } = useUserRole();
  const [authOpen, setAuthOpen] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-card border border-border rounded-2xl p-8 text-center card-shadow">
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-black text-primary mb-3">
            Espace administration
          </h1>
          <p className="text-muted-foreground mb-6">
            Connectez-vous avec un compte autorise pour gerer les actualites,
            les publications, les evenements et les utilisateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setAuthOpen(true)} className="gap-2">
              <Lock className="h-4 w-4" />
              Se connecter
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Retour au site
            </Button>
          </div>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  if (!isContentEditor) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-card border border-border rounded-2xl p-8 text-center card-shadow">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-black text-primary mb-3">
            Acces reserve
          </h1>
          <p className="text-muted-foreground mb-6">
            Votre compte est connecte, mais il ne dispose pas encore des droits
            administrateur ou moderateur.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold text-foreground">
                    Espace administration
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? "Administrateur" : "Moderateur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className={`grid w-full max-w-4xl ${isAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="content" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Contenus
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              Actualites
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Evenements
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content">
            <SiteContentManager />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesManager />
          </TabsContent>

          <TabsContent value="news">
            <NewsManager />
          </TabsContent>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UsersManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
