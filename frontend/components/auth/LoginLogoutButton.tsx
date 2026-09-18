// components/auth/LoginLogoutButton.tsx
"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider"; // <- adjust path to YOUR AuthProvider

export default function LoginLogoutButton() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const pathname = usePathname() ?? "/";
  const locale = params?.locale ?? "en";


  const { user, loading, logout } = useAuth();

  const loginHref = `/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`;


  async function handleLogout() {
    await logout();
    router.replace(`/${locale}`);
    router.refresh();
  }

  if (loading) return <span className="text-sm text-black/50">…</span>;

  if (!user) {
    return (
      <Link
        href={loginHref}
        className="rounded-lg border border-black/20 px-4 py-2 text-base text-black hover:bg-black/5 transition"
      >
        Login
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-black text-white px-4 py-2 text-base hover:bg-black/90 transition"
    >
      Logout
    </button>
  );
}
