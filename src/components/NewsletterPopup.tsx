import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const STORAGE_KEY = "newsletter_popup_dismissed";
const POPUP_DELAY = 3000;

export const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), POPUP_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("id, is_active")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        if (existing.is_active) {
          setError("Cette adresse e-mail est déjà inscrite à notre newsletter.");
          setLoading(false);
          return;
        }
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, unsubscribed_at: null })
          .eq("id", existing.id);
      } else {
        await supabase.from("newsletter_subscribers").insert({
          email: email.trim().toLowerCase(),
          is_active: true,
        });
      }

      setSuccess(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setTimeout(() => setOpen(false), 3000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
      <DialogContent
        className="p-0 border-0 overflow-hidden max-w-md"
        style={{
          background: "linear-gradient(160deg, #ffffff 0%, #fff5f5 60%, #fff0f0 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(220,38,38,0.15)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Red top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

        <div className="px-8 py-7">
          {!success ? (
            <>
              {/* Logo + Header */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={logoFocom}
                  alt="Logo FOCOM UES Iliad"
                  className="h-14 w-auto object-contain mb-4"
                />

                <h2 className="text-gray-900 text-xl font-bold text-center leading-tight mb-2">
                  Restez informé·e de vos droits
                </h2>
                <p className="text-gray-500 text-sm text-center leading-relaxed">
                  Recevez les actualités syndicales, les informations sur le droit du travail et toutes les actions de votre section FOCOM.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="votre@email.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus-visible:ring-red-200"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold tracking-wide text-white"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    border: "none",
                    boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Je m'inscris à la newsletter"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full text-gray-400 text-xs hover:text-gray-600 transition-colors py-1"
                >
                  Non merci, je ne souhaite pas m'inscrire
                </button>
              </form>

              <p className="text-gray-300 text-[10px] text-center mt-4 leading-relaxed">
                Vos données sont traitées par FOCOM uniquement pour l'envoi de la newsletter.
                Désabonnement possible à tout moment.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <img
                src={logoFocom}
                alt="Logo FOCOM"
                className="h-12 w-auto object-contain mb-4"
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  border: "1.5px solid rgba(220,38,38,0.25)",
                }}
              >
                <CheckCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-gray-900 text-xl font-bold mb-2">Bienvenue !</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Votre inscription est confirmée. Vous recevrez bientôt les actualités FOCOM.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
