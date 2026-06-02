import { useAuth } from "@/hooks/useAuth";
import ProfilEnAttente from "@/components/ProfilEnAttente";

export default function RequireValidated({ children }: { children: React.ReactNode }) {
  const { user, isValidated, loading } = useAuth();
  if (loading) return null;
  if (!user) return <>{children}</>;
  if (!isValidated) return <ProfilEnAttente />;
  return <>{children}</>;
}
