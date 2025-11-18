"use client";

// ========================================
// AUTH CONTEXT
// ========================================

import React, { createContext, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { authApi } from "./api";
import { User } from "@/types";
import { getAxiosErrorMessage } from "./utils";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    role: "admin" | "doctor" | "lab_technician" | "researcher";
    hospital_name?: string;
    department?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally refresh user data from API
          const response = await authApi.me();
          setUser(response);
          localStorage.setItem("user", JSON.stringify(response));
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      setUser(response.user);
      router.push("/dashboard");
    } catch (error: unknown) {
      throw new Error(getAxiosErrorMessage(error) || "Login failed");
    }
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    hospital_name?: string;
    department?: string;
    role: "admin" | "doctor" | "lab_technician" | "researcher";
  }) => {
    try {
      await authApi.register(data);

      // Auto login after register
      await login(data.email, data.password);
    } catch (error: unknown) {
      throw new Error(getAxiosErrorMessage(error) || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.me();
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
