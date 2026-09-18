// components/events/EventDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { Event } from "@types";
import EventService from "../../../services/events/eventService";
import { fmtDateRange } from "../../../utils/formatDate";
import { useCommonText } from "../../../i18n/common";

export default function EventDetail() {
  const params = useParams<{ locale: string; eventId: string }>();
  const locale = params?.locale ?? "en";
  const eventId = params?.eventId;
  const t = useCommonText(locale);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await EventService.getEventById(eventId);
        setEvent(data);
      } catch (e: any) {
        setError(e?.message || t.events.failedToLoadEvent);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, t.events.failedToLoadEvent]);

  if (loading) {
    return <p className="p-6">{t.events.loadingEvent}</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!event) {
    return <p className="p-6">{t.events.eventNotFound}</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-600 mt-1">
          📍 {event.location}
        </p>
        <p className="text-gray-600">
          🗓️ {fmtDateRange(event.startDate, event.endDate)}
        </p>
      </header>

      <section className="text-gray-800">
        <p>{event.description}</p>
      </section>

      <div className="flex gap-4">
        <Link
          href={`/${locale}/events/${event.id}/shifts`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.events.viewShifts}
        </Link>

        <Link
          href={`/${locale}/events`}
          className="inline-block border px-4 py-2 rounded hover:bg-gray-100"
        >
          {t.events.backToEvents}
        </Link>
      </div>
    </main>
  );
}
