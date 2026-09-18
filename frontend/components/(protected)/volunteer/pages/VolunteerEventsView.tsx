// components/(protected)/volunteer/pages/VolunteerEventsView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getVolunteerDashboardData } from "../../../../services/volunteer/volunteerService";
import type { EventNeedHelp } from "@types";
import Loading from "../../../ui/Loading";
import { useCommonText } from "../../../../i18n/common";

function fmtDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
  const s = fmt(start);
  const e = fmt(end);
  return s === e ? s : `${s} – ${e}`;
}

export default function VolunteerEventsView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  const [events, setEvents] = useState<EventNeedHelp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVolunteerDashboardData();
      setEvents(data.eventsNeedingHelp);
    } catch (e) {
      setError((e as Error).message || t.volunteerEventsPage.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch-on-mount: this effect's only job is to kick off the initial
    // load and let the async function's own try/finally set loading and
    // error/data state once the request resolves — the standard pattern
    // for a component with no data-fetching library in front of it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // `load` is intentionally left out of the dependency array: it's a new
    // function identity every render (it's also reused by the Refresh
    // button and passed down as onChanged), so including it would re-run
    // this effect on every render instead of once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{t.volunteerEventsPage.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.volunteerEventsPage.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
          >
            {loading ? t.volunteerEventsPage.refreshing : t.volunteerEventsPage.refresh}
          </button>
          <Link
            href={`/${locale}/volunteer`}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5"
          >
            {t.volunteerEventsPage.backToDashboard}
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loading label={t.volunteerEventsPage.loadingEvents} size="lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          <p className="font-medium text-base mb-1">{t.volunteerEventsPage.emptyTitle}</p>
          <p>{t.volunteerEventsPage.emptyDesc}</p>
          <Link
            href={`/${locale}/volunteer`}
            className="mt-4 inline-block text-sm text-black underline"
          >
            {t.volunteerEventsPage.goToDashboard}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-black/10 bg-white p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{event.title}</p>
                  <p className="text-xs text-black/60 mt-1">
                    {fmtDateRange(event.startDate, event.endDate)}
                  </p>
                  {event.location && (
                    <p className="text-xs text-black/60 mt-0.5">📍 {event.location}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 text-xs">
                  <span className="font-semibold">{event.openShiftCount}</span>{" "}
                  <span className="text-black/60">
                    {t.volunteerEventsPage.openShiftsLabel(event.openShiftCount)}
                  </span>
                </span>
              </div>
              <Link
                href={`/${locale}/volunteer/shifts`}
                className="inline-block text-xs text-black/60 hover:text-black underline"
              >
                {t.volunteerEventsPage.browseOpenShifts}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
