"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Customer } from "@/lib/types";

type AuthContextValue = {
  user: Customer | null;
  login: (email: string, password: string) => Promise<Customer>;
  register: (payload: { fullName: string; email: string; phone?: string; password: string }) => Promise<Customer>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const key = "molare-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function authenticate(endpoint: string, body: unknown) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");
      window.localStorage.setItem(key, JSON.stringify(data.user));
      setUser(data.user);
      return data.user as Customer;
    }

    return {
      user,
      login: (email, password) => authenticate("/api/auth/login", { email, password }),
      register: (payload) => authenticate("/api/auth/register", payload),
      logout: () => {
        window.localStorage.removeItem(key);
        setUser(null);
      }
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
