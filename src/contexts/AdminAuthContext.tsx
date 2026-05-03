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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session Supabase au chargement
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const adminUser = await buildAdminUser(session.user);
        setUser(adminUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const adminUser = await buildAdminUser(session.user);
          setUser(adminUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Construit l'objet AdminUser depuis le user Supabase
  const buildAdminUser = async (supabaseUser: User): Promise<AdminUser | null> => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", supabaseUser.id)
        .in("role", ["admin", "redacteur", "moderator"])
        .limit(1)
        .single();

      if (!data) return null;

      const role = data.role === "admin" ? "admin" : "editor";
      const username = supabaseUser.email?.split("@")[0] ?? "admin";
      return { username, role, supabaseUser };
    } catch {
      return null;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    // username peut être un email complet ou juste la partie avant @
    const email = username.includes("@") ? username : `${username}@focomues-iliad.fr`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error("Login error:", error?.message);
      return false;
    }

    const adminUser = await buildAdminUser(data.user);
    if (!adminUser) {
      await supabase.auth.signOut();
      return false;
    }

    setUser(adminUser);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return null;

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}