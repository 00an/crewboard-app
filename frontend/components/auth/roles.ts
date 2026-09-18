// components/(open)/auth/roles.ts
import { RoleName } from "@types";

export const ROLE_RANK: Record<RoleName, number> = {
  VOLUNTEER: 1,
  ORGANIZER: 2,
  ADMIN: 3,
};

export function hasAtLeast(role: string | null | undefined, min: RoleName) {
  const r = role as RoleName | undefined;
  if (!r) return false;
  return ROLE_RANK[r] >= ROLE_RANK[min];
}

export function hasRole(
  role: string | null | undefined,
  allowed: RoleName[]
) {
  const r = role as RoleName | undefined;
  if (!r) return false;
  return allowed.includes(r);
}
