// components/events/EventsView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Event } from "@types";

import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import EventService from "../../../services/events/eventService";
import { useCommonText } from "../../../i18n/common";

export default function EventsView() {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch-on-mount: this effect's only job is to kick off the initial
    // load and let the async function's own try/finally set loading and
    // error/data state once the request resolves — the standard pattern
    // for a component with no data-fetching library in front of it.
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await EventService.getAllEvents();
        setEvents(data);
      } catch (e: any) {
        setError(e?.message || t.events.failedToLoadEvents);
      } finally {
        setLoading(false);
      }
    })();
  }, [t.events.failedToLoadEvents]);

  // AddEventForm already calls the backend and gives us back the real,
  // server-created event (with its real id) — just append it as-is rather
  // than fabricating a client-side id, which previously made a freshly
  // added event's Details/Shifts links point at the wrong event until the
  // page was refreshed.
  const handleAddEvent = (createdEvent: Event) => {
    setEvents((prev) => [...prev, createdEvent]);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.events.pageTitle}</h1>
      </div>

      <AddEventForm onAddEvent={handleAddEvent} />

      {loading && <p>{t.events.loadingEvents}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && <EventList events={events} />}
    </main>
  );
}
