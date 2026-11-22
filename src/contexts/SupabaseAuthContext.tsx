import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseAuthContextType {
  session: Session | null;
  user: User | null;
  userRoles: string[];
  loading: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);
const AUTH_ROLE_TIMEOUT_MS = 8000;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = AUTH_ROLE_TIMEOUT_MS) => {
  let timeoutId: ReturnType<typeof window.setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Délai d'authentification dépassé")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .then((result) => result),
      );
      if (error) throw error;
      setUserRoles(data?.map((r) => r.role) || []);
    } catch {
      setUserRoles([]);
    }
  };

  useEffect(() => {
    let active = true;
    const failSafe = window.setTimeout(() => {
      if (active) setLoading(false);
    }, AUTH_ROLE_TIMEOUT_MS);

    withTimeout(supabase.auth.getSession())
      .then(({ data: { session } }) => {
        if (!active) return;
        setSession(session);
        setLoading(false);
        if (session?.user) void fetchUserRoles(session.user.id);
      })
      .catch(() => {
        if (active) setLoading(false);
      })
      .finally(() => window.clearTimeout(failSafe));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      setLoading(false);
      if (session?.user) {
        void fetchUserRoles(session.user.id);
      } else {
        setUserRoles([]);
      }
    });

    return () => {
      active = false;
      window.clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: string) => userRoles.includes(role);
  const hasAnyRole = (roles: string[]) => roles.some((r) => userRoles.includes(r));

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        userRoles,
        loading,
        hasRole,
        hasAnyRole,
        signOut,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  return ctx;
}
