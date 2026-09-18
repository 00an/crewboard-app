// components/(admin)/adminHome/AdminHomeView.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCommonText } from "../../../i18n/common";

export default function AdminHomeView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale).adminHome;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">{t.eventsTitle}</h2>
          <p className="text-gray-600 mb-4">{t.eventsDesc}</p>
          <Link
            href={`/${locale}/events`}
            className="text-blue-600 font-medium hover:underline"
          >
            {t.manageEvents}
          </Link>
        </div>

        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">{t.usersTitle}</h2>
          <p className="text-gray-600 mb-4">{t.usersDesc}</p>
          <Link
            href={`/${locale}/admin/users`}
            className="text-blue-600 font-medium hover:underline"
          >
            {t.manageUsers}
          </Link>
        </div>

        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">{t.systemTitle}</h2>
          <p className="text-gray-600 mb-4">{t.systemDesc}</p>
          <Link
            href={`/${locale}/admin/settings`}
            className="text-blue-600 font-medium hover:underline"
          >
            {t.viewSettings}
          </Link>
        </div>
      </section>

      {/* Overview */}
      <section className="border rounded-xl p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-3">{t.responsibilitiesTitle}</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>{t.responsibility1}</li>
          <li>{t.responsibility2}</li>
          <li>{t.responsibility3}</li>
          <li>{t.responsibility4}</li>
        </ul>
      </section>
    </main>
  );
}
