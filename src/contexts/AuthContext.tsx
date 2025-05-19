import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiService } from "@/services/api";
import { AUTH_CONFIG } from "@/config/constants";

interface User {
  id: number;
  cpf: string;
  nome: string;
  is_adm: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (cpf: string, senha: string, nome: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar usuário do storage:", error);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (cpf: string, senha: string) => {
    try {
      setIsLoading(true);
      const user = await apiService.login(cpf, senha);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      setIsLoading(false);
    }
  };

  const register = async (cpf: string, senha: string, nome: string) => {
    try {
      setIsLoading(true);
      await apiService.register({ cpf, senha, nome });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_adm || false,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
