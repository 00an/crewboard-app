"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../auth/AuthProvider";
import { buildBase } from "./nav";
import { useCommonText } from "../../../i18n/common";
import LanguageSwitcher from "./LanguageSwitcher";

export default function OrganizerNavbar() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const base = buildBase(params?.locale);
  const t = useCommonText(params?.locale);

  const { loading, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace(`${base}/login`);
  };

  return (
    <header className="w-full bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href={`${base}/organizer`} className="font-semibold text-lg">
          CrewBoard
        </Link>

        <nav className="flex items-center gap-4">
          <LanguageSwitcher locale={params?.locale} />

          {loading ? (
            <span className="text-white/70 text-sm">…</span>
          ) : (
            <>
              <Link href={`${base}/organizer`} className="hover:underline">
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
          )}
        </nav>
      </div>
    </header>
  );
}
