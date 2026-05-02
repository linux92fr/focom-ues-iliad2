import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email("Veuillez entrer une adresse email valide").max(255, "L'email est trop long");

export function NewsletterSubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const sendWelcomeEmail = async (emailAddress: string, unsubscribeToken: string) => {
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { email: emailAddress, unsubscribeToken },
      });
    } catch (err) {
      // Non-bloquant : l'abonnement est réussi même si l'email échoue
      console.error('Failed to send welcome email:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubscribed(false);

    try {
      emailSchema.parse(email);

      // Nouvel abonné — générer un token unique
      const unsubscribeToken = crypto.randomUUID();

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          is_active: true,
          unsubscribe_token: unsubscribeToken,
          subscribed_at: new Date().toISOString()
        });

      if (insertError) {
        // Handle unique constraint violation (already subscribed)
        if (insertError.code === '23505') {
          toast({
            title: "Déjà abonné",
            description: "Cette adresse email est déjà abonnée à notre newsletter.",
          });
          setIsSubscribed(true);
          return;
        }
        throw insertError;
      }

      // Envoyer l'email de bienvenue
      await sendWelcomeEmail(email, unsubscribeToken);

      toast({
        title: "Abonnement réussi",
        description: "Merci de vous être abonné ! Un email de bienvenue vous a été envoyé.",
      });
      setIsSubscribed(true);
      setEmail('');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Newsletter subscription error:', error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de l'abonnement.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="newsletter-email" className="text-background">Votre adresse email</Label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting || isSubscribed}
          className="bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || isSubscribed}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Abonnement en cours...
          </>
        ) : isSubscribed ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Abonné !
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            S'abonner
          </>
        )}
      </Button>
      {isSubscribed && (
        <p className="text-sm text-center text-background/70">
          Vous recevrez bientôt nos dernières actualités.
        </p>
      )}
    </form>
  );
}
