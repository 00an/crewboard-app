// components/(organizer)/organizerHome/OrganizerHomeView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../auth/AuthProvider";
import EventService from "../../../services/events/eventService";
import type { Event } from "@types";
import { useCommonText } from "../../../i18n/common";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrganizerHomeView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const { user } = useAuth();
  const t = useCommonText(locale);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await EventService.getAllEvents();
        setEvents(data);
      } catch (e) {
        setEventError((e as Error).message || t.events.failedToLoadEvents);
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, [t.events.failedToLoadEvents]);

  return (
    <section className="max-w-5xl mx-auto space-y-8 px-6 py-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-indigo-800">
          {t.organizerHome.title}
        </h1>
        <p className="text-sm text-gray-600">
          {user ? `${t.organizerHome.signedInAs} ${user.email}` : t.organizerHome.manageIntro}
        </p>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/${locale}/events`}
          className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 hover:shadow-sm transition block"
        >
          <h2 className="font-semibold text-indigo-700 text-lg mb-1">{t.organizerHome.myEvents}</h2>
          <p className="text-sm text-gray-600">
            {t.organizerHome.myEventsDesc}
          </p>
          <span className="mt-3 inline-block text-xs font-medium text-indigo-600">
            {t.organizerHome.goToEvents} →
          </span>
        </Link>

        <div className="rounded-xl border border-indigo-100 bg-white p-5 hover:shadow-sm transition">
          <h2 className="font-semibold text-indigo-700 text-lg mb-1">{t.organizerHome.volunteers}</h2>
          <p className="text-sm text-gray-600">
            {events.length > 0
              ? t.organizerHome.volunteersActive(events.length)
              : t.organizerHome.volunteersIdle}
          </p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-5 hover:shadow-sm transition">
          <h2 className="font-semibold text-indigo-700 text-lg mb-1">{t.organizerHome.schedules}</h2>
          <p className="text-sm text-gray-600">
            {t.organizerHome.schedulesDesc}
          </p>
        </div>
      </div>

      {/* Recent events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{t.organizerHome.recentEvents}</h2>
          <Link
            href={`/${locale}/events`}
            className="text-sm text-indigo-600 hover:underline"
          >
            {t.organizerHome.viewAll} →
          </Link>
        </div>

        {loadingEvents && (
          <p className="text-sm text-gray-500">{t.events.loadingEvents}</p>
        )}

        {eventError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {eventError}
          </div>
        )}

        {!loadingEvents && !eventError && events.length === 0 && (
          <div className="rounded-xl border border-black/10 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            {t.organizerHome.noEventsYet}{" "}
            <Link href={`/${locale}/events`} className="text-indigo-600 hover:underline">
              {t.organizerHome.createFirstEvent}
            </Link>
            .
          </div>
        )}

        {!loadingEvents && events.length > 0 && (
          <ul className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 hover:shadow-sm transition"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtDate(event.startDate)} → {fmtDate(event.endDate)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Link
                    href={`/${locale}/events/${event.id}`}
                    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium hover:bg-black/5 transition"
                  >
                    {t.events.details}
                  </Link>
                  <Link
                    href={`/${locale}/events/${event.id}/shifts`}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    {t.events.shifts}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
