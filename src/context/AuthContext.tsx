/**
 * Auth Context
 * ------------
 * Context untuk manajemen state autentikasi user.
 *
 * Menyediakan:
 * - user: Data user yang sedang login
 * - login(): Fungsi untuk login
 * - register(): Fungsi untuk registrasi
 * - logout(): Fungsi untuk logout
 * - upgradeSubscription(): Upgrade plan langganan
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/services/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    tenantName?: string
  ) => Promise<boolean>;
  logout: () => void;
  upgradeSubscription: (planId: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage on mount
    const storedUser = localStorage.getItem("datalaris_user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Ensure subscription field exists for legacy data or real data if missing
        if (!parsedUser.subscription) {
          (parsedUser as User & { subscription?: string }).subscription =
            "starter"; // Default fallback
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem("datalaris_user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login({ email, password });

      // Backend response structure:
      // {
      //   "message": "Login successful",
      //   "data": {
      //     "token": "...",
      //     "user": { ... }
      //   }
      // }
      // Or based on auth_controller: utils.Success(c, "...", gin.H{ "token": ..., "user": ... })

      const { token, user: userData } = response.data.data!;

      // Normalize user data if needed
      const normalizedUser = userData as User & { subscription?: string };
      if (!normalizedUser.subscription) normalizedUser.subscription = "starter"; // Default to starter if backend missing it

      localStorage.setItem("token", token);
      localStorage.setItem("datalaris_user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Let the component handle the error display
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    tenantName?: string
  ): Promise<boolean> => {
    try {
      // Generate unique tenant name to avoid UNIQUE constraint violation
      // Use provided name or fallback to user name + short unique suffix
      const uniqueTenantName =
        tenantName || `${name}_${Date.now().toString(36)}`;

      // Step 1: Register the user
      await api.auth.register({
        name,
        email,
        password,
        tenant_name: uniqueTenantName,
      });

      // Step 2: Auto-login after successful registration
      // Backend register doesn't return token, so we need to login
      const loginResponse = await api.auth.login({ email, password });
      const { token, user: userData } = loginResponse.data.data!;

      // Normalize user data
      const normalizedUser = userData as User & { subscription?: string };
      if (!normalizedUser.subscription) normalizedUser.subscription = "starter";

      localStorage.setItem("token", token);
      localStorage.setItem("datalaris_user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const upgradeSubscription = (planId: string): void => {
    if (!user) return;
    const updatedUser = { ...user, subscription: planId } as User & {
      subscription: string;
    };
    setUser(updatedUser);
    localStorage.setItem("datalaris_user", JSON.stringify(updatedUser));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("datalaris_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, upgradeSubscription, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
