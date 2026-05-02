import PageShell from '@/components/PageShell';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';



const NewsletterUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de désabonnement manquant');
        return;
      }

      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({ is_active: false })
          .eq('unsubscribe_token', token);

        if (error) throw error;

        setStatus('success');
        setMessage('Vous avez été désabonné avec succès de notre newsletter.');
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors du désabonnement.');
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <PageShell subtitle="Newsletter">

      <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours...</h1>
              <p className="text-gray-600">Veuillez patienter</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Désabonnement réussi ✓</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-8">Vous ne recevrez plus nos newsletters. Vous pouvez vous réabonner à tout moment depuis notre site.</p>
              <a 
                href="/" 
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Retour à l'accueil
              </a>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-8">Si le problème persiste, veuillez nous contacter.</p>
              <div className="space-x-4">
                <a 
                  href="/" 
                  className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Retour à l'accueil
                </a>
                <a 
                  href="/contact" 
                  className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Nous contacter
                </a>
              </div>
            </>
          )}
        </div>
      </div>

    </PageShell>
  );
};

export default NewsletterUnsubscribe;