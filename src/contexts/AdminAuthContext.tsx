import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminUser {
  username: string;
  role: "admin" | "editor";
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const STORAGE_KEY = "focom_admin_session";
const ADMIN_CREDENTIALS = [
  { username: "admin", password: "focom2026!", role: "admin" as const },
  { username: "editeur", password: "focom2026!", role: "editor" as const },
];

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    const match = ADMIN_CREDENTIALS.find(
      (c) => c.username === username && c.password === password
    );
    if (match) {
      setUser({ username: match.username, role: match.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

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