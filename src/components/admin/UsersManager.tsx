import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, User, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables, Database } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles extends Profile {
  roles: AppRole[];
  role_id?: string;
}

const UsersManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          roles: userRole ? [userRole.role] : ["user"],
          role_id: userRole?.id,
        };
      });

      return usersWithRoles;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, newRole }: { userId: string; roleId?: string; newRole: AppRole }) => {
      if (roleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Rôle mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleRoleChange = (user: UserWithRoles, newRole: AppRole) => {
    updateRoleMutation.mutate({
      userId: user.user_id,
      roleId: user.role_id,
      newRole,
    });
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="gap-1 bg-red-500 hover:bg-red-600">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
            <Shield className="h-3 w-3" />
            Modérateur
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            Utilisateur
          </Badge>
        );
    }
  };

  const getCurrentRole = (roles: AppRole[]): AppRole => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("moderator")) return "moderator";
    return "user";
  };

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.display_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.member_number?.toLowerCase().includes(searchLower) ||
      user.section?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestion des utilisateurs
          {users && (
            <Badge variant="secondary" className="ml-2">
              {users.length} utilisateur{users.length > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>N° Adhérent</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Changer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const currentRole = getCurrentRole(user.roles);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {(user.display_name || user.email || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <span>{user.display_name || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email || "—"}
                      </TableCell>
                      <TableCell>
                        {user.member_number ? (
                          <Badge variant="outline">{user.member_number}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{user.section || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(user.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{getRoleBadge(currentRole)}</TableCell>
                      <TableCell>
                        <Select
                          value={currentRole}
                          onValueChange={(value: AppRole) => handleRoleChange(user, value)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="moderator">Modérateur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {searchTerm ? (
              <p>Aucun utilisateur trouvé pour "{searchTerm}"</p>
            ) : (
              <>
                <p>Aucun utilisateur inscrit</p>
                <p className="text-sm">Les utilisateurs apparaîtront après inscription</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersManager;
