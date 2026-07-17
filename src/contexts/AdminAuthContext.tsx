import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminUser {
  username: string;
  role: "admin" | "editor";
  supabaseUser: User;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<boolean>;
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
    // Vérification initiale de session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        if (role && ADMIN_ROLES.includes(role)) {
          setUser(buildAdminUser(session.user, role));
        }
      }
      setReady(true);
    });

    // Écoute les changements — uniquement TOKEN_REFRESHED pour éviter les boucles
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          return;
        }
        // TOKEN_REFRESHED = session restaurée depuis localStorage
        if (event === "TOKEN_REFRESHED") {
          const role = await fetchUserRole(session.user.id);
          if (role && ADMIN_ROLES.includes(role)) {
            setUser(buildAdminUser(session.user, role));
          } else {
            setUser(null);
          }
        }
        // SIGNED_IN est géré directement par la fonction login()
        // pour éviter les double-appels et les boucles
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const email = username.includes("@")
      ? username
      : `${username}@focomues-iliad.fr`;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const role = await fetchUserRole(data.user.id);
    if (!role || !ADMIN_ROLES.includes(role)) {
      await supabase.auth.signOut();
      return false;
    }

    setUser(buildAdminUser(data.user, role));
    return true;
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