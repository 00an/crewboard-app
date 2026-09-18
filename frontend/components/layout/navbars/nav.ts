export function buildBase(locale?: string) {
  return `/${locale || "en"}`;
}
