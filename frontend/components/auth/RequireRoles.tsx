// components/auth/RequireRoles.tsx
"use client";

import React, { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { Role } from "@types";
import { hasRole } from "./roles";

function homeByRole(role: Role, locale: string) {
  switch (role) {
    case "ADMIN":
      return `/${locale}/admin`;
    case "ORGANIZER":
      return `/${locale}/organizer`;
    default:
      return `/${locale}/volunteer`;
  }
}

export default function RequireRoles({
  allow,
  children,
  fallback,
}: {
  allow: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  useEffect(() => {
    if (loading) return;

    // Not logged in -> go login (with redirect back)
    if (!role) {
      router.replace(
        `/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`
      );
      return;
    }

    // Logged in but wrong role -> send to their own home
    if (!hasRole(role, allow)) {
      router.replace(homeByRole(role, locale));
    }
  }, [loading, role, router, locale, pathname, allow]);

  if (loading) return null;
  if (!role) return null;
  if (!hasRole(role, allow)) return fallback ?? null;

  return <>{children}</>;
}
