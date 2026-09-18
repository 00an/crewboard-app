// hooks/useAuthGuard.ts
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { me } from "../services/auth/service";

/**
 * Client-side auth guard for protected pages/components.
 * Returns `true` when auth check is done and user is allowed.
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await me();

      if (cancelled) return;

      if (!user) {
        const locale = pathname.split("/")[1] || "en";
        router.replace(
          `/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`
        );
        return;
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return ready;
}
