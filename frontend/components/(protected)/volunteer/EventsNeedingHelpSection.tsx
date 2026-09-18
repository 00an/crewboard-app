// components/volunteer/EventsNeedingHelpSection.tsx
"use client";

import { useParams } from "next/navigation";
import type { EventNeedHelp } from "../../../types";
import Section from "../../ui/Section";
import EmptyState from "../../ui/EmptyState";
import { useCommonText } from "../../../i18n/common";

type Props = {
  events: EventNeedHelp[];
  className?: string;
};

function fmtDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startText = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const endText = end.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return startText === endText ? startText : `${startText} – ${endText}`;
}

function EventNeedHelpCard({
  event,
  openShiftLabel,
}: {
  event: EventNeedHelp;
  openShiftLabel: (n: number) => string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{event.title}</p>
          <p className="text-xs text-black/60 mt-1">
            {fmtDateRange(event.startDate, event.endDate)}
          </p>
          {event.location ? (
            <p className="text-xs text-black/60 mt-1">📍 {event.location}</p>
          ) : null}
        </div>

        <div className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 text-xs">
          <span className="font-semibold">{event.openShiftCount}</span>{" "}
          <span className="text-black/60">{openShiftLabel(event.openShiftCount)}</span>
        </div>
      </div>
    </div>
  );
}

export default function EventsNeedingHelpSection({ events, className }: Props) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale).eventsNeedingHelp;

  return (
    <Section title={t.title} className={className}>
      {events.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {events.map((e) => (
            <EventNeedHelpCard key={e.id} event={e} openShiftLabel={t.openShift} />
          ))}
        </div>
      )}
    </Section>
  );
}
