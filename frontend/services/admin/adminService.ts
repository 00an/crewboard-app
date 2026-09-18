// services/admin/adminService.ts
import type { AdminUserSummary } from "@types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

async function getAllUsers(): Promise<AdminUserSummary[]> {
  const res = await fetch(api("/api/admin/users"), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch users (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}

const adminService = {
  getAllUsers,
};

export default adminService;
