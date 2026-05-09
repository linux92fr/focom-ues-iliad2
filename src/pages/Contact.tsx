import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  subject: z.string().trim().min(1, "Le sujet est requis").max(200),
  message: z.string().trim().min(10, "Le message doit faire au moins 10 caractères").max(2000),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactInfo = [
    { icon: Phone, title: "Téléphone", details: "01 23 45 67 89", subtext: "Du lundi au vendredi, 9h-18h" },
    { icon: Mail, title: "Email", details: "contact@focomues-iliad.fr", subtext: "Réponse sous 48h" },
    { icon: MapPin, title: "Adresse", details: "Paris, France", subtext: "Siège social" },
    { icon: Clock, title: "Permanences", details: "Mardi et Jeudi", subtext: "12h-14h" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
    });

    if (error) {
      console.error("Supabase error:", error);
      toast.error("Une erreur est survenue", {
        description: "Impossible d'envoyer votre message. Réessayez ou contactez-nous directement.",
      });
    } else {
      toast.success("Message envoyé avec succès !", {
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Contactez-nous
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Une question ? Un besoin d'assistance ? Notre équipe est à votre écoute
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Nos coordonnées</h2>
              {contactInfo.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="text-foreground">{item.details}</p>
                      <p className="text-sm text-muted-foreground">{item.subtext}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name" name="name" value={formData.name}
                          onChange={handleChange} placeholder="Votre nom"
                          maxLength={100} className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email" name="email" type="email" value={formData.email}
                          onChange={handleChange} placeholder="votre@email.fr"
                          maxLength={255} className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject" name="subject" value={formData.subject}
                        onChange={handleChange} placeholder="Objet de votre message"
                        maxLength={200} className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message" name="message" value={formData.message}
                        onChange={handleChange} placeholder="Votre message..."
                        rows={6} maxLength={2000}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      <div className="flex justify-between items-center">
                        {errors.message
                          ? <p className="text-sm text-destructive">{errors.message}</p>
                          : <span />}
                        <span className="text-xs text-muted-foreground">{formData.message.length}/2000</span>
                      </div>
                    </div>

                    <Button type="submit" size="lg" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" />Envoyer le message</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;