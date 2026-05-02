import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '@/integrations/supabase/client';

const AMOUNTS = [1, 2, 3, 5];

const DonWidget = () => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(2);
  const [customAmount, setCustomAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const handleApprove = async (data: { orderID: string }) => {
    await supabase.functions.invoke('paypal-webhook', {
      body: { orderID: data.orderID, amount: finalAmount, isAnon: false, message: '' },
    });
    setSuccess(true);
  };

  return (
    <PayPalScriptProvider options={{
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: 'EUR',
      locale: 'fr_FR',
      intent: 'capture',
    }}>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="bg-background border border-border rounded-xl p-4 w-72">
            {success ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">🙏</p>
                <p className="text-sm font-medium">Merci pour votre soutien !</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium mb-1">Offrez-nous un café</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Chaque don soutient nos actions syndicales.
                </p>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setCustomAmount(''); }}
                      className={`py-1.5 text-xs rounded-md border transition-all ${
                        amount === a && !customAmount
                          ? 'border-foreground bg-muted font-medium'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {a} €
                    </button>
                  ))}
                </div>
                <div className="relative mb-3">
                  <input
                    type="number" min="1" placeholder="Autre montant" value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-1.5 pr-7 text-xs bg-background focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="text-muted-foreground flex-shrink-0">
                    <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1"/>
                    <path d="M4 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <p className="text-xs text-muted-foreground">
                    Vos infos bancaires ne sont jamais enregistrées sur ce site
                  </p>
                </div>
                {finalAmount >= 1 && (
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'donate', height: 35 }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{
                          amount: { currency_code: 'EUR', value: finalAmount.toString() },
                          description: 'Don FOCOM UES ILIAD',
                        }],
                      })
                    }
                    onApprove={(data) => handleApprove(data)}
                  />
                )}
              </>
            )}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 bg-[#0070ba] text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 9h10v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" fill="white"/>
            <path d="M15 10h1.5a1.5 1.5 0 010 3H15" stroke="white" strokeWidth="1.2" fill="none"/>
            <path d="M8 8c0-1 .8-1.5.8-2.5M11 8c0-1 .8-1.5.8-2.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div className="text-left">
            <p className="text-xs font-medium leading-tight">Nous soutenir</p>
            <p className="text-xs leading-tight opacity-75">Offrez-nous un café</p>
          </div>
        </button>
      </div>
    </PayPalScriptProvider>
  );
};

export default DonWidget;
