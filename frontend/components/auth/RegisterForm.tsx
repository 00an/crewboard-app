// components/auth/RegisterForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authTranslations, AuthLocale, AuthText } from "../../i18n/auth";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  password: "Password",
};

async function registerErrorMessage(res: Response, t: AuthText): Promise<string> {
  let data: { message?: string; fields?: Record<string, string> } = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body — fall through to a status-based message below
  }

  if (data.fields && Object.keys(data.fields).length > 0) {
    return Object.entries(data.fields)
      .map(([field, msg]) => `${FIELD_LABELS[field] ?? field}: ${msg}`)
      .join(" ");
  }

  if (res.status === 429) return t.tooManyAttempts;
  if (res.status === 409) return t.emailInUse;
  return data.message || t.genericError;
}

export default function RegisterForm() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = authTranslations[locale as AuthLocale] ?? authTranslations.en;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Frontend validation (mirrors the backend's PasswordPolicyService so
    // users get the real requirement before submitting, not just a generic
    // 400 after the fact).
    if (password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    if (password.length < 12) {
      setError(t.passwordTooShort);
      return;
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError(t.passwordTooWeak);
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    };

    setSubmitting(true);
    try {
      const res = await fetch(api("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError(await registerErrorMessage(res, t));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-sm grid gap-4 border rounded-xl p-6 shadow bg-white text-center">
          <div className="text-4xl">✅</div>
          <h1 className="text-2xl font-semibold">{t.successTitle}</h1>
          <p className="text-sm text-gray-600">{t.successMessage}</p>
          <button
            type="button"
            onClick={() => router.replace(`/${locale}/login`)}
            className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition"
          >
            {t.goToLogin}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm grid gap-3 border rounded-xl p-6 shadow bg-white"
      >
        <h1 className="text-2xl font-semibold mb-1">{t.registerTitle}</h1>

        {error && (
          <div className="bg-red-100 text-red-800 text-sm rounded p-2">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">{t.firstNameLabel}</span>
            <input
              className="border rounded px-3 py-2 w-full min-w-0"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">{t.lastNameLabel}</span>
            <input
              className="border rounded px-3 py-2 w-full min-w-0"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm">{t.emailLabel}</span>
          <input
            className="border rounded px-3 py-2 w-full min-w-0"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
            required
            minLength={12}
          />
          <span className="text-xs text-gray-500">{t.passwordTooWeak}</span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.confirmPasswordLabel}</span>
          <input
            className="border rounded px-3 py-2 w-full min-w-0"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition disabled:opacity-50 mt-1"
        >
          {submitting ? t.registering : t.registerButton}
        </button>

        <p className="text-center text-sm text-gray-600 mt-1">
          {t.alreadyHaveAccount}{" "}
          <Link href={`/${locale}/login`} className="text-emerald-700 hover:underline">
            {t.signIn}
          </Link>
        </p>
      </form>
    </main>
  );
}