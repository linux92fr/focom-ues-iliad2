import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield, Bell, Lock } from "lucide-react";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isContentEditor } = useUserRole();

  if (!user) return null;

  // Initiales depuis display_name ou email
  const initials = user.user_metadata?.display_name
    ? user.user_metadata.display_name.substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center hover:opacity-90 transition-opacity ring-2 ring-primary/20 focus:outline-none"
          aria-label="Mon compte"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">Mon compte</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isContentEditor && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Tableau de bord admin</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => navigate("/profil")}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/notifications")}>
          <Bell className="mr-2 h-4 w-4" />
          <span>Mes notifications</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/profil")}>
          <Lock className="mr-2 h-4 w-4" />
          <span>Changer mon mot de passe</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;