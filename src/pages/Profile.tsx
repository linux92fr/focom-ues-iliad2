import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Hash, Building, Loader2, Save } from "lucide-react";
import { profileSchema, validateFormData } from "@/lib/validations";

interface ProfileData {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  member_number: string | null;
  section: string | null;
  membership_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    display_name: "",
    phone: "",
    section: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setFormData({
          display_name: data.display_name || "",
          phone: data.phone || "",
          section: data.section || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    // Validate form data
    const validation = validateFormData(profileSchema, {
      display_name: formData.display_name || null,
      phone: formData.phone || null,
      section: formData.section || null,
    });

    if (validation.success === false) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        toast({
          title: "Erreur de validation",
          description: firstError,
          variant: "destructive",
        });
      }
      return;
    }

    setFormErrors({});
    const validData = validation.data;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: validData.display_name || null,
          phone: validData.phone || null,
          section: validData.section || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non renseignée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const initials = formData.display_name?.substring(0, 2).toUpperCase() || 
                   user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-muted/30 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Carte de profil */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{formData.display_name || "Membre"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>N° Adhérent: {profile.member_number || "Non attribué"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis: {formatDate(profile.membership_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Section: {profile.section || "Non renseignée"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire de modification */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Modifiez vos informations de contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Nom d'affichage</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="display_name"
                          name="display_name"
                          value={formData.display_name}
                          onChange={handleInputChange}
                          className={`pl-10 ${formErrors.display_name ? "border-destructive" : ""}`}
                          placeholder="Votre nom"
                          maxLength={100}
                        />
                      </div>
                      {formErrors.display_name && (
                        <p className="text-sm text-destructive">{formErrors.display_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={user.email || ""}
                          className="pl-10 bg-muted"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        L'email ne peut pas être modifié
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`pl-10 ${formErrors.phone ? "border-destructive" : ""}`}
                          placeholder="06 12 34 56 78"
                          maxLength={20}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-sm text-destructive">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="section"
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          className={`pl-10 ${formErrors.section ? "border-destructive" : ""}`}
                          placeholder="Votre section"
                          maxLength={100}
                        />
                      </div>
                      {formErrors.section && (
                        <p className="text-sm text-destructive">{formErrors.section}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
