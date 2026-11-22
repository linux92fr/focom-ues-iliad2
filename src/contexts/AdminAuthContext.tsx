import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminUser {
  username: string;
  role: "admin" | "editor";
  supabaseUser: User;
}

export type LoginResult = { ok: true } | { ok: false; reason: "invalid_credentials" | "no_admin_role" };

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const ADMIN_ROLES = ["admin", "secretaire", "representant", "redacteur", "tresorier", "gestionnaire_documents"];

async function fetchUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0].role as string;
}

function buildAdminUser(supabaseUser: User, role: string): AdminUser {
  return {
    username: supabaseUser.email?.split("@")[0] ?? "admin",
    role: role === "admin" ? "admin" : "editor",
    supabaseUser,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const applyAdminAccess = async (supabaseUser: User) => {
      const role = await fetchUserRole(supabaseUser.id);
      if (!active) return;
      if (role && ADMIN_ROLES.includes(role)) {
        setUser(buildAdminUser(supabaseUser, role));
      } else {
        setUser(null);
      }
      setReady(true);
    };

    // Vérification initiale de session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void applyAdminAccess(session.user);
      } else if (active) {
        setReady(true);
      }
    }).catch(() => {
      if (active) setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setReady(true);
          return;
        }

        // On diffère l'appel Supabase hors du callback d'authentification
        // pour éviter les blocages du verrou interne de supabase-js.
        window.setTimeout(() => {
          if (active) void applyAdminAccess(session.user);
        }, 0);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const email = username.includes("@")
      ? username
      : `${username}@focomues-iliad.fr`;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, reason: "invalid_credentials" };

    const role = await fetchUserRole(data.user.id);
    if (!role || !ADMIN_ROLES.includes(role)) {
      await supabase.auth.signOut();
      return { ok: false, reason: "no_admin_role" };
    }

    setUser(buildAdminUser(data.user, role));
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      ready,
      login,
      logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
