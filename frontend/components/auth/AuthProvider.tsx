// components/auth/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  me as meService,
  login as loginService,
  logout as logoutService,
} from "../../services/auth/service";
import type { Me, Role } from "@types";

type LoginResult = { ok: true } | { ok: false; status: number; message?: string };

type AuthCtx = {
  user: Me | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const normalizeRole = (r: string | null | undefined): Role | null => {
  if (!r) return null;
  const cleaned = r.startsWith("ROLE_") ? r.replace("ROLE_", "") : r;
  return cleaned as Role;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const u = await meService();
      setUser(u);
      setRole(normalizeRole(u?.role));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch-on-mount: this effect's only job is to kick off the initial
    // load and let the async function's own try/finally set loading and
    // error/data state once the request resolves — the standard pattern
    // for a component with no data-fetching library in front of it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const res = await loginService(email, password);
      if (!res.ok) return res;

      // cookie set -> pull user/role once
      const u = await meService();
      setUser(u);
      setRole(normalizeRole(u?.role));
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, role, loading, refresh, login, logout }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
