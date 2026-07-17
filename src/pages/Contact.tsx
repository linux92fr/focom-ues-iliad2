import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, Loader2, HelpCircle } from "lucide-react";
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
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Mail className="mr-1 h-3.5 w-3.5" /> Contact
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Contactez-nous
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Une question, un besoin d'assistance ? Notre équipe FO COM est à votre écoute.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <a href="#contact-form"><Send className="mr-2 h-4 w-4" /> Envoyer un message</a>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/faq"><HelpCircle className="mr-2 h-4 w-4" /> Consulter la FAQ</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {contactInfo.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Nos coordonnées</h2>
          {contactInfo.map((item, index) => (
            <Card key={index} className="border-slate-200 shadow-sm">
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
          <Card className="border-slate-200 shadow-sm">
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
      </section>
    </main>
  );
};

export default Contact;