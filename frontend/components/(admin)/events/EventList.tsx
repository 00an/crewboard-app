// components/events/EventList.tsx
"use client";

import type { Event } from "@types";
import EventItem from "./EventItem";

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
