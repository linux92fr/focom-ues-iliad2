import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section className="py-16 gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary-foreground rounded-full translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur mb-6">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Restez informé
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Inscrivez-vous à notre newsletter pour recevoir les dernières actualités syndicales directement dans votre boîte mail.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/95 border-0 text-foreground placeholder:text-muted-foreground h-12 pr-4"
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-6 gap-2"
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Inscrit !
                </>
              ) : (
                <>
                  S'inscrire
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-primary-foreground/60 text-sm mt-4">
            Nous respectons votre vie privée. Désabonnement possible à tout moment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
