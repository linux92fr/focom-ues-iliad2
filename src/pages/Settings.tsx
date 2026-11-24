import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { isValidWhatsAppNumber, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Bell, Shield, Trash2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    newsAlerts: true,
    eventReminders: true,
    whatsappNotifications: false,
    whatsappNumber: "",
  });

  type BooleanPreferenceKey = "emailNotifications" | "newsAlerts" | "eventReminders" | "whatsappNotifications";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setPreferences((prev) => ({
          ...prev,
          newsAlerts: data.notify_articles,
          eventReminders: data.notify_actions,
          whatsappNotifications: data.notify_whatsapp,
          whatsappNumber: data.whatsapp_number || "",
        }));
      }
    };
    loadPreferences();
  }, [user]);

  const savePreferences = async (next: typeof preferences) => {
    if (!user) return;
    const rawNumber = next.whatsappNumber.trim();
    const numberValid = rawNumber === "" || isValidWhatsAppNumber(rawNumber);
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      notify_articles: next.newsAlerts,
      notify_actions: next.eventReminders,
      notify_whatsapp: next.whatsappNotifications,
      whatsapp_number:
        next.whatsappNotifications && numberValid && rawNumber !== ""
          ? normalizeWhatsAppNumber(rawNumber)
          : null,
    });
    if (error) {
      toast.error("Erreur lors de l'enregistrement des préférences");
      return;
    }
    if (next.whatsappNotifications && !numberValid) {
      toast.error("Numéro WhatsApp invalide (format international, ex. +33612345678)");
      return;
    }
    if (next.whatsappNotifications && rawNumber === "") {
      toast.info("Renseignez votre numéro WhatsApp pour recevoir les notifications");
      return;
    }
    toast.success("Préférences mises à jour");
  };

  const handlePreferenceChange = (key: BooleanPreferenceKey) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      void savePreferences(next);
      return next;
    });
  };

  const handleWhatsAppNumberChange = (value: string) => {
    setPreferences((prev) => ({ ...prev, whatsappNumber: value }));
  };

  const handleWhatsAppNumberBlur = () => {
    void savePreferences(preferences);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleDeleteAccount = async () => {
    // Note: In a real app, this would call a server function to delete the account
    toast.info("Cette fonctionnalité nécessite de contacter un administrateur.");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-grow bg-muted/30 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <SettingsIcon className="h-8 w-8" />
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les communications importantes par email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={() => handlePreferenceChange("emailNotifications")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsAlerts">Alertes actualités</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié des nouvelles publications
                    </p>
                  </div>
                  <Switch
                    id="newsAlerts"
                    checked={preferences.newsAlerts}
                    onCheckedChange={() => handlePreferenceChange("newsAlerts")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="eventReminders">Rappels d'événements</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des rappels avant les événements de l'agenda
                    </p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={preferences.eventReminders}
                    onCheckedChange={() => handlePreferenceChange("eventReminders")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="whatsappNotifications">Notifications WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les actualités et l'agenda par WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="whatsappNotifications"
                    checked={preferences.whatsappNotifications}
                    onCheckedChange={() => handlePreferenceChange("whatsappNotifications")}
                  />
                </div>

                {preferences.whatsappNotifications && (
                  <div className="space-y-0.5">
                    <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      inputMode="tel"
                      placeholder="+33612345678"
                      value={preferences.whatsappNumber}
                      onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                      onBlur={handleWhatsAppNumberBlur}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format international requis, ex. +33612345678
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité et connexion
                </CardTitle>
                <CardDescription>
                  Gérez votre session et la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email du compte</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription>
                  Actions irréversibles concernant votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes vos données seront
                        définitivement supprimées. Pour des raisons de sécurité,
                        veuillez contacter un administrateur pour effectuer cette opération.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Contacter un admin
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Settings;
