// components/events/EventCard.tsx
import type { EventSummary } from "../../types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function EventCard({ event }: { event: EventSummary }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3">
      <p className="text-sm font-semibold">{event.title}</p>
      <p className="text-xs text-black/60 mt-1">
        {fmtDate(event.startDate)} → {fmtDate(event.endDate)}
      </p>
      <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
        {event.location ? (
          <span className="rounded-full border border-black/10 px-2 py-0.5 text-black/70">
            {event.location}
          </span>
        ) : null}
        {typeof event.openShiftCount === "number" ? (
          <span className="rounded-full border border-black/10 px-2 py-0.5 text-black/70">
            Open shifts: {event.openShiftCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}
