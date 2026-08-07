"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type User } from "../lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrapping auth state on mount is the standard pattern
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const me = await api.me();
        setUser(me);
      } catch {
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    localStorage.setItem("access_token", res.access_token);
    setUser(res.user);
  }

  async function register(email: string, password: string, fullName?: string) {
    const res = await api.register(email, password, fullName);
    localStorage.setItem("access_token", res.access_token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
