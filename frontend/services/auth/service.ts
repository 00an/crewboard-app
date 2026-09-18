// services/auth/service.ts
import type { Me as MeApi } from "@types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);


async function parseJsonSafe<T>(res: Response, fallback: T): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Cookie + JWT login:
 * backend validates credentials, creates JWT, sets it in an httpOnly cookie.
 */
export async function login(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const res = await fetch(api("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include", // ✅ receive cookie
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!res.ok) {
    // The backend's error body always uses { message }, not { error } — read
    // the field it actually sends so the real reason (e.g. "Too many
    // requests...") reaches the UI instead of a raw status-code fallback.
    const data = await parseJsonSafe<{ message?: string }>(res, {});
    return { ok: false, status: res.status, message: data.message };
  }

  return { ok: true };
}

/**
 * Cookie logout:
 * backend clears cookie (Max-Age=0 / expires in past)
 */
export async function logout(): Promise<void> {
  await fetch(api("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

/**
 * Returns current user if cookie is valid, otherwise null.
 */
export async function me(): Promise<MeApi | null> {
  const res = await fetch(api("/api/auth/me"), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await parseJsonSafe<MeApi | null>(res, null);
  if (!data) return null;

  return { email: data.email, role: data.role };
}
/**
 * Cookie-auth version of "is logged in" (must be async).
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await me();
  return !!user;
}
