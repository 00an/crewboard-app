"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shared EN/NL switcher used by every navbar. Swaps the locale segment in
 * the current path and links to it — previously this logic was duplicated
 * (and, in two of the three navbars, missing entirely, so organizers and
 * volunteers had no way to switch language at all).
 */
export default function LanguageSwitcher({ locale }: { locale?: string }) {
  const pathname = usePathname() ?? "";
  const current = locale ?? "en";
  const other = current === "en" ? "nl" : "en";
  const switchPath = pathname.replace(`/${current}`, `/${other}`);

  return (
    <Link
      href={switchPath}
      className="text-sm font-medium opacity-80 hover:opacity-100 underline"
    >
      {other.toUpperCase()}
    </Link>
  );
}
