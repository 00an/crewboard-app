// components/(admin)/settings/AdminSettingsView.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCommonText } from "../../../i18n/common";

export default function AdminSettingsView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.adminSettings.title}</h1>
          <p className="text-gray-600 mt-1">{t.adminSettings.subtitle}</p>
        </div>
        <Link
          href={`/${locale}/admin`}
          className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
        >
          {t.adminSettings.backToDashboard}
        </Link>
      </header>

      {/* General settings */}
      <section className="border rounded-xl bg-white shadow-sm divide-y">
        <div className="px-5 py-4">
          <h2 className="font-semibold text-gray-800 mb-3">{t.adminSettings.generalTitle}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.adminSettings.platformNameLabel}</p>
                <p className="text-xs text-gray-500">{t.adminSettings.platformNameDesc}</p>
              </div>
              <input
                type="text"
                defaultValue="CrewBoard"
                className="border rounded px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-black/10"
                readOnly
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.adminSettings.defaultLocaleLabel}</p>
                <p className="text-xs text-gray-500">{t.adminSettings.defaultLocaleDesc}</p>
              </div>
              <select
                defaultValue="en"
                className="border rounded px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-black/10"
                disabled
              >
                <option value="en">{t.adminSettings.localeEnglish}</option>
                <option value="nl">{t.adminSettings.localeDutch}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access control */}
        <div className="px-5 py-4">
          <h2 className="font-semibold text-gray-800 mb-3">{t.adminSettings.accessControlTitle}</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-gray-300" />
              <div>
                <p className="text-sm font-medium">{t.adminSettings.requireAuthLabel}</p>
                <p className="text-xs text-gray-500">{t.adminSettings.requireAuthDesc}</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-gray-300" />
              <div>
                <p className="text-sm font-medium">{t.adminSettings.rbacLabel}</p>
                <p className="text-xs text-gray-500">{t.adminSettings.rbacDesc}</p>
              </div>
            </label>
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400">
        {t.adminSettings.footerNote}
      </p>
    </main>
  );
}
