// components/auth/LoginForm.tsx
"use client";

import { useMemo, useState, FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { me } from "../../services/auth/service";
import { Role } from "@types";
import { authTranslations, AuthLocale, AuthText } from "../../i18n/auth";

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

// Maps a failed-login response to a friendly, localized message. The
// backend's own reason text is intentionally not shown as-is: it's
// English-only and status-driven meaning matters more than its exact
// wording (e.g. a 429 always means "slow down", regardless of the body).
function loginErrorMessage(
  status: number,
  message: string | undefined,
  t: AuthText
): string {
  if (status === 429) return t.tooManyAttempts;
  if (status === 401) return t.loginFailedInvalid;
  return message || t.genericError;
}

function redirectAllowed(redirectTo: string, role: Role, locale: string) {
  const admin = `/${locale}/admin`;
  const organizer = `/${locale}/organizer`;
  const volunteer = `/${locale}/volunteer`;

  switch (role) {
    case "ADMIN":
      return redirectTo.startsWith(admin);
    case "ORGANIZER":
      return redirectTo.startsWith(organizer);
    default:
      return redirectTo.startsWith(volunteer);
  }
}

export default function LoginForm() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  const sp = useSearchParams();
  const searchParams = useMemo(() => sp ?? new URLSearchParams(), [sp]);

  const t = authTranslations[locale as AuthLocale] ?? authTranslations.en;

  const { login: authLogin, refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const redirectParam = searchParams.get("redirectTo");

  const redirectToSafe = useMemo(() => {
    if (!redirectParam) return null;
    if (!redirectParam.startsWith("/")) return null;
    if (redirectParam === `/${locale}`) return null;
    if (redirectParam.startsWith(`/${locale}/login`)) return null;
    return redirectParam;
  }, [redirectParam, locale]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const result = await authLogin(email.trim(), password);

    if (!result.ok) {
      setSubmitting(false);
      setErrorMsg(loginErrorMessage(result.status, result.message, t));
      return;
    }

    // sync provider state (optional but nice)
    await refresh();

    // ✅ deterministic: ask backend who we are NOW
    const current = await me();
    const r = ((current?.role ?? "VOLUNTEER") as Role);

    const home = homeByRole(r, locale);

    if (redirectToSafe && redirectAllowed(redirectToSafe, r, locale)) {
      router.replace(redirectToSafe);
    } else {
      router.replace(home);
    }

    setSubmitting(false);
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm grid gap-3 border rounded-xl p-6 shadow bg-white"
      >
        <h1 className="text-2xl font-semibold mb-2">{t.loginTitle}</h1>

        {errorMsg && (
          <div className="bg-red-100 text-red-800 text-sm rounded p-2">
            {errorMsg}
          </div>
        )}

        <label className="grid gap-1">
          <span className="text-sm">{t.emailLabel}</span>
          <input
            className="border rounded px-3 py-2 w-full min-w-0"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.passwordLabel}</span>
          <input
            className="border rounded px-3 py-2 w-full min-w-0"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? t.loggingIn : t.loginButton}
        </button>
      </form>
    </main>
  );
}
