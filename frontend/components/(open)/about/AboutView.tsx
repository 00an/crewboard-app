"use client";

import { aboutTranslations, AboutLocale } from "../../../i18n/about";

export default function AboutView({ locale }: { locale: string }) {
  const t = aboutTranslations[locale as AboutLocale] ?? aboutTranslations.en;

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-8">
      <section>
        <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
        <p className="text-lg text-gray-700">{t.intro}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">{t.missionTitle}</h2>
        <p className="text-gray-700">{t.missionText}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">{t.whatWeDoTitle}</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          {t.whatWeDo.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">{t.whyTitle}</h2>
        <p className="text-gray-700">{t.whyText}</p>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-3">{t.valuesTitle}</h2>
        <ul className="space-y-2 text-gray-700">
          {t.values.map((v) => (
            <li key={v.label}>
              <strong>{v.label}:</strong> {v.text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
