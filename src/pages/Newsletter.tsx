import { Mail, Newspaper, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewsletterSubscriptionForm } from '@/components/NewsletterSubscriptionForm';

export default function Newsletter() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container mx-auto max-w-5xl px-4 py-12 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              <Mail className="h-4 w-4" /> Newsletter FO COM UES ILIAD
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 lg:text-5xl">
                Recevez nos informations directement par email
              </h1>
              <p className="text-lg leading-relaxed text-slate-600">
                Actualités sociales, informations CSE, NAO, droits des salariés et alertes importantes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardContent className="space-y-2 p-4">
                  <Newspaper className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-900">Actualités</p>
                  <p className="text-xs text-slate-500">Les dernières publications importantes.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <ShieldCheck className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-900">Vos droits</p>
                  <p className="text-xs text-slate-500">Repères utiles pour les salariés.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden shadow-xl">
            <CardContent className="p-0">
              <div className="space-y-5 bg-slate-950 p-6 text-white lg:p-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">S’abonner à la newsletter</h2>
                  <p className="text-sm text-slate-300">
                    Entrez votre adresse email pour recevoir les informations FO COM UES ILIAD.
                  </p>
                </div>
                <NewsletterSubscriptionForm />
                <p className="text-xs text-slate-400">
                  Vous pouvez vous désabonner à tout moment depuis le lien présent dans nos emails.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
