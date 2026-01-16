"use client";
import { createContext, useContext, useCallback, useEffect, useState } from "react";

type AuthContextValue = {
  isLogged: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLogged, setIsLoggedInternal] = useState(false);
  const [loading, setLoading] = useState(true);

  type SwaMe = {
    clientPrincipal: null | {
      identityProvider: string;
      userDetails: string;
      userRoles: string[];
    };
  };

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/.auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = (await res.json()) as SwaMe;
      const isAuthed = !!data.clientPrincipal?.userRoles?.includes("authenticated");

      setIsLoggedInternal(isAuthed);
    } catch {
      setIsLoggedInternal(false);
    } finally {
      setLoading(false);
    }
  }, []);


  // Check once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isLogged,
        loading,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
