import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const CONTACT_MESSAGES_KEY = "focom_contact_messages";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending
      await new Promise((r) => setTimeout(r, 800));

      // Save to localStorage
      const newMessage: ContactMessage = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };

      const existingMessages = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || "[]");
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify([newMessage, ...existingMessages]));

      setSubmitted(true);
      toast.success("Message envoyé avec succès !");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Nous Contacter</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Nous Contacter</h2>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl">
            Une question, un besoin d'accompagnement ? Vos élus FOCOM sont à votre écoute. N'hésitez pas à nous écrire.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Envoyez-nous un message</h3>

              {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Message envoyé avec succès !</p>
                    <p className="text-xs text-green-700 mt-1">
                      Nous vous répondrons dans les meilleurs délais.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Votre nom et prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="votre.email@iliad.fr"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-slate-700">
                    Sujet *
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="Ex : Question sur mes droits, Demande d'accompagnement..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Décrivez votre demande en détail..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phone */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-bold text-slate-900">Téléphone</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">01 87 15 43 11</p>
              <p className="text-xs text-slate-500 mt-1">Appel non surtaxé</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="font-bold text-slate-900">Email</h4>
              </div>
              <a href="mailto:contact@focomues-iliad.fr" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                contact@focomues-iliad.fr
              </a>
              <p className="text-xs text-slate-500 mt-1">Nous vous répondons rapidement</p>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-bold text-slate-900">Adresse</h4>
              </div>
              <p className="text-sm text-slate-600">
                FOCOM UES ILIAD<br />
                8 rue de la Ville l'Évêque<br />
                75008 Paris
              </p>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="font-bold text-slate-900">Horaires</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Lundi - Vendredi</span>
                  <span className="font-medium text-slate-900">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Samedi</span>
                  <span className="font-medium text-slate-900">Sur rendez-vous</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/mentions-legales")} className="text-xs text-slate-500 hover:text-slate-700">
                Mentions légales
              </button>
              <button onClick={() => navigate("/rgpd")} className="text-xs text-slate-500 hover:text-slate-700">
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
