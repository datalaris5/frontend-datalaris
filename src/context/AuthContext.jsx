import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage on mount
    const storedUser = localStorage.getItem("datalaris_user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure subscription field exists for legacy data or real data if missing
        if (!parsedUser.subscription) {
          parsedUser.subscription = "starter"; // Default fallback
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

  const login = async (email, password) => {
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

      const { token, user: userData } = response.data.data;

      // Normalize user data if needed
      // Normalize user data if needed
      if (!userData.subscription) userData.subscription = "starter"; // Default to starter if backend missing it

      localStorage.setItem("token", token);
      localStorage.setItem("datalaris_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Let the component handle the error display
    }
  };

  const register = async (name, email, password) => {
    // Backend doesn't have a public register endpoint yet.
    // We will simulate a successful registration and login for the audit/demo to work.

    const newUser = {
      name,
      email,
      role: "user", // Default role
      subscription: "starter", // Default to starter
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`,
      id: Date.now(), // Mock ID
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Auto-login after register
    const mockToken = "mock-jwt-token-for-demo";
    localStorage.setItem("token", mockToken);
    localStorage.setItem("datalaris_user", JSON.stringify(newUser));
    setUser(newUser);

    return true;
  };

  const upgradeSubscription = (planId) => {
    if (!user) return;
    const updatedUser = { ...user, subscription: planId };
    setUser(updatedUser);
    localStorage.setItem("datalaris_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
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

export const useAuth = () => useContext(AuthContext);
