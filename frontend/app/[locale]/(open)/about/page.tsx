import AboutView from "../../../../components/(open)/about/AboutView";

export default async function LocaleAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AboutView locale={locale} />;
}
