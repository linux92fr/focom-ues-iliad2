import { createClient } from '@supabase/supabase-js';

// ─── Client Supabase ─────────────────────────────────────────────────────────
// Les variables sont lues depuis le fichier .env (Vite : prefix VITE_).
// Si elles sont absentes, on tombe sur un stub inoffensif qui renvoie des
// tableaux vides — utile pour le dev local sans Supabase configuré.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

type AnyClient = ReturnType<typeof createClient>;

function makeStub(): AnyClient {
  const builder: any = Promise.resolve({ data: [], error: null });
  builder.order = () => makeStub().from('').select();
  builder.eq = () => makeStub().from('').select();
  builder.limit = () => makeStub().from('').select();
  builder.single = () => Promise.resolve({ data: null, error: null });
  return {
    from: () => ({
      select: () => {
        const p: any = Promise.resolve({ data: [], error: null });
        p.order = () => p;
        p.eq = () => p;
        p.limit = () => p;
        p.single = () => Promise.resolve({ data: null, error: null });
        return p;
      },
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  } as unknown as AnyClient;
}

export const supabase: AnyClient =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : (console.warn(
        '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY absents — utilisation d\'un stub vide.'
      ),
      makeStub());
