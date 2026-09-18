// components/(admin)/users/AdminUsersView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../auth/AuthProvider";
import { useCommonText } from "../../../i18n/common";
import adminService from "../../../services/admin/adminService";
import type { AdminUserSummary } from "@types";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  ORGANIZER: "bg-indigo-100 text-indigo-700 border-indigo-200",
  VOLUNTEER: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const defaultRoleBadge = "bg-gray-100 text-gray-700 border-gray-200";

export default function AdminUsersView() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch-on-mount: this effect's only job is to kick off the initial
    // load and let the async function's own try/finally set loading and
    // error/data state once the request resolves — the standard pattern
    // for a component with no data-fetching library in front of it.
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (e: any) {
        setError(e?.message || t.adminUsers.failedToLoad);
      } finally {
        setLoading(false);
      }
    })();
  }, [t.adminUsers.failedToLoad]);

  if (authLoading || !user) return null;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.adminUsers.title}</h1>
          <p className="text-gray-600 mt-1">
            {t.adminUsers.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin`}
          className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
        >
          {t.adminUsers.backToDashboard}
        </Link>
      </header>

      <section className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        {t.adminUsers.notice}
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <section className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">{t.adminUsers.colId}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">{t.adminUsers.colEmail}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">{t.adminUsers.colUsername}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">{t.adminUsers.colRoles}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">{t.adminUsers.colStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={5}>
                  {t.adminUsers.loading}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={5}>
                  {t.adminUsers.empty}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge[role] || defaultRoleBadge}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        u.enabled
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {u.enabled ? t.adminUsers.statusEnabled : t.adminUsers.statusDisabled}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
