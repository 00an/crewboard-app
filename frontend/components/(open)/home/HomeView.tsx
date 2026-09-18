// components/(open)/home/HomeView.tsx
"use client";

import { useParams } from "next/navigation";
import { homeTranslations, HomeLocale } from "../../../i18n/home";

export default function HomeView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = homeTranslations[locale as HomeLocale] ?? homeTranslations.en;

  return (
    <main className="flex flex-col items-center justify-center px-6 py-16 space-y-16">

      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          {t.heroTitle}
          <span className="block text-blue-600">{t.heroHighlight}</span>
        </h1>
        <p className="text-lg text-gray-600">{t.heroSubtitle}</p>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 border rounded-lg text-center space-y-3">
          <h2 className="text-xl font-semibold">{t.feature1Title}</h2>
          <p className="text-gray-600">{t.feature1Text}</p>
        </div>

        <div className="p-6 border rounded-lg text-center space-y-3">
          <h2 className="text-xl font-semibold">{t.feature2Title}</h2>
          <p className="text-gray-600">{t.feature2Text}</p>
        </div>

        <div className="p-6 border rounded-lg text-center space-y-3">
          <h2 className="text-xl font-semibold">{t.feature3Title}</h2>
          <p className="text-gray-600">{t.feature3Text}</p>
        </div>
      </section>

    </main>
  );
}
