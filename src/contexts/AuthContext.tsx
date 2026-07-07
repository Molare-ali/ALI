"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Customer } from "@/lib/types";

type AuthContextValue = {
  user: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Customer>;
  register: (payload: { fullName: string; email: string; phone?: string; password: string }) => Promise<Customer>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const key = "molare-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.localStorage.removeItem(key);
    const controller = new AbortController();

    async function hydrateUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void hydrateUser();
    return () => controller.abort();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function authenticate(endpoint: string, body: unknown) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");
      window.localStorage.removeItem(key);
      setUser(data.user);
      return data.user as Customer;
    }

    return {
      user,
      isLoading,
      login: (email, password) => authenticate("/api/auth/login", { email, password }),
      register: (payload) => authenticate("/api/auth/register", payload),
      logout: async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin"
        });
        window.localStorage.removeItem(key);
        setUser(null);
      }
    };
  }, [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
