"use client";

export default function LoadingScreen({
  title = "Loading…",
  subtitle = "Hang on a sec.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-black/20 border-t-black animate-spin" />
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-black/60 mt-1">{subtitle}</p>
      </div>
    </main>
  );
}
