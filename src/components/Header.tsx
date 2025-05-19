import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  isAuthenticated: boolean;
  cpf?: string | null;
}

export function Header({ isAuthenticated, cpf }: HeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-slate-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            SinGeFe
          </h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {cpf}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
