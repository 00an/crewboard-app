"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buildBase } from "./nav";
import LoginLogoutButton from "@components/auth/LoginLogoutButton";
import { navTranslations, NavLocale } from "../../../i18n/nav";

export default function OpenNavbar() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const base = buildBase(locale);
  const t = navTranslations[locale as NavLocale] ?? navTranslations.en;

  return (
    <header className="w-full border-b border-black/10 bg-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href={`${base}`} className="font-semibold text-3xl text-black">
          {t.brand}
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href={`${base}`}
            className="text-lg text-black/85 hover:text-black transition"
          >
            {t.home}
          </Link>
          <Link
            href={`${base}/about`}
            className="text-lg text-black/85 hover:text-black transition"
          >
            {t.about}
          </Link>

          <LoginLogoutButton />

          <Link
            href={`${base}/register`}
            className="rounded-lg border border-black/20 px-3 py-1.5 text-sm text-black hover:bg-black/5 transition"
          >
            {t.register}
          </Link>
        </nav>
      </div>
    </header>
  );
}
