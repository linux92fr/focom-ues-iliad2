import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRoleState {
  roles: AppRole[];
  isAdmin: boolean;
  isModerator: boolean;
  isContentEditor: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;

        const userRoles = data?.map((r) => r.role) || [];
        setRoles(userRoles);
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const isContentEditor = isAdmin || isModerator;

  return { roles, isAdmin, isModerator, isContentEditor, loading };
};
