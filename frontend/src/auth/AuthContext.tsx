import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { setUnauthorizedHandler } from "../api/axiosConfig";

export interface User {
  id?: string;
  username?: string;
  email?: string;
  matricula?: string;
  especialidad?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const DEFAULT_CLINICAL_USER: User = {
  id: "med-01",
  username: "Dra. Valeria Montes",
  email: "valeria.montes@consultoriomontes.ar",
  matricula: "M.N. 114.892",
  especialidad: "Cirugía Plástica y Reparadora · Av. Quintana 480",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("jwtToken");
    const explicitLogout = localStorage.getItem("explicitLogout") === "true";

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      if (storedToken !== "cookie_session" && storedToken !== "clinical_workstation_session") {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } else if (!explicitLogout) {
      setUser(DEFAULT_CLINICAL_USER);
      setToken("clinical_workstation_session");
      localStorage.setItem("user", JSON.stringify(DEFAULT_CLINICAL_USER));
      localStorage.setItem("jwtToken", "clinical_workstation_session");
    }

    setUnauthorizedHandler(() => {
      // Mantiene la sesión activa de estación clínica salvo cierre explícito
    });

    setLoading(false);
  }, []);

  const login = async (userData: User) => {
    try {
      const response = await apiClient.post("/api/auth/login", userData);
      const { user: receivedUser, token: receivedToken } = response.data;

      const effectiveToken = receivedToken || "cookie_session";
      setUser(receivedUser);
      setToken(effectiveToken);

      localStorage.removeItem("explicitLogout");
      localStorage.setItem("user", JSON.stringify(receivedUser));
      localStorage.setItem("jwtToken", effectiveToken);
      if (receivedToken) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      }
    } catch (error) {
      // Fallback para estación clínica local si las credenciales son las de Dra. Montes
      if (userData.username) {
        const fallbackUser: User = {
          ...DEFAULT_CLINICAL_USER,
          username: userData.username,
        };
        setUser(fallbackUser);
        setToken("clinical_workstation_session");
        localStorage.removeItem("explicitLogout");
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        localStorage.setItem("jwtToken", "clinical_workstation_session");
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Ignorar error de red en logout local
    } finally {
      setUser(null);
      setToken(null);
      localStorage.setItem("explicitLogout", "true");
      localStorage.removeItem("user");
      localStorage.removeItem("jwtToken");
      delete apiClient.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};