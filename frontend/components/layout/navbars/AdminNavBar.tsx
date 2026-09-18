// components/layout/navbars/NavBar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { logout, me } from "../../../services/auth/service";
import type { User } from "@types";
import { useCommonText } from "../../../i18n/common";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const base = `/${locale}`;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const u = await me();
      if (cancelled) return;
      setUser(u);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const onLogout = async () => {
    await logout();
    setUser(null);
    router.replace(`${base}/login`);
  };

  return (
    <header className="w-full bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo / Home */}
        <Link href={`${base}/admin`} className="font-semibold text-lg">
          CrewBoard
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {/* 🌍 Language switcher */}
          <LanguageSwitcher locale={locale} />

          {loading ? (
            <span className="text-white/70 text-sm">…</span>
          ) : user ? (
            <>
              <Link href={`${base}/admin`} className="hover:underline">
                {t.nav.dashboard}
              </Link>
              <Link href={`${base}/events`} className="hover:underline">
                {t.nav.events}
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className="rounded border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link
              href={`${base}/login?redirectTo=${encodeURIComponent(pathname)}`}
              className="rounded border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              {t.nav.login}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
