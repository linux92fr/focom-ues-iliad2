import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_REQUEST_TIMEOUT_MS = 12000;
const AUTH_SESSION_RECOVERY_TIMEOUT_MS = 2500;

const authTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
  message = "La connexion prend trop de temps. Vérifiez votre réseau puis réessayez.",
) => {
  let timeoutId: ReturnType<typeof window.setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    // Le spinner global ne doit jamais dépendre d'un verrou Supabase bloqué.
    const failSafe = window.setTimeout(() => {
      if (active) setLoading(false);
    }, 8000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    }).catch(() => {
      if (active) setLoading(false);
    }).finally(() => window.clearTimeout(failSafe));

    return () => {
      active = false;
      window.clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await authTimeout(supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName,
          },
        },
      }), AUTH_REQUEST_TIMEOUT_MS, "L'inscription prend trop de temps. Vérifiez votre réseau puis réessayez.");
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await authTimeout(supabase.auth.signInWithPassword({
        email,
        password,
      }));
      if (error) return { error: error as Error };
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
      }
      return { error: null };
    } catch (error) {
      try {
        const { data } = await authTimeout(
          supabase.auth.getSession(),
          AUTH_SESSION_RECOVERY_TIMEOUT_MS,
          "La session n'a pas pu être vérifiée.",
        );
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
          return { error: null };
        }
      } catch {
        // La session reste incertaine : on rend la main à l'interface au lieu de bloquer le spinner.
      }
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Scope "local" : efface la session du navigateur sans dépendre d'un appel
    // serveur de révocation (qui échoue si le token est déjà expiré/invalide et
    // laissait alors l'utilisateur connecté). On force ensuite l'état à null pour
    // que l'UI se mette à jour immédiatement, même si signOut a levé une erreur.
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.warn("signOut: échec de la révocation, déconnexion locale forcée", error);
    }
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
