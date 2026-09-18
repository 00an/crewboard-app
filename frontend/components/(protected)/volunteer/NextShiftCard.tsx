// components/volunteer/NextShiftCard.tsx
"use client";

import { useParams } from "next/navigation";
import type { AssignedShiftDto } from "../../../types";
import { useCommonText } from "../../../i18n/common";

function soonestUpcoming(shifts: AssignedShiftDto[]) {
  const now = Date.now();

  const upcoming = shifts
    .map((s) => ({ s, t: new Date(s.startTime).getTime() }))
    .filter((x) => !Number.isNaN(x.t) && x.t >= now)
    .sort((a, b) => a.t - b.t);

  return upcoming[0]?.s ?? null;
}

function fmtStart(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtEndTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NextShiftCard({ assigned }: { assigned: AssignedShiftDto[] }) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale).nextShift;

  const next = soonestUpcoming(assigned);

  const startsInLabel = (startIso: string) => {
    const start = new Date(startIso).getTime();
    if (Number.isNaN(start)) return null;

    // Date.now() is impure by nature; that's fine here — this is a "time
    // until shift starts" label with no correctness impact if it's a beat
    // stale between renders (it recomputes on the dashboard's own refresh).
    // eslint-disable-next-line react-hooks/purity
    const diffMs = start - Date.now();
    if (diffMs <= 0) return t.startingNow;

    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return t.startsInMin(mins);

    const hours = Math.floor(mins / 60);
    const rem = mins % 60;

    if (hours < 24) return t.startsInHours(hours, rem);

    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return t.startsInDays(days, remHours);
  };

  if (!next) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <p className="text-sm font-semibold">{t.title}</p>
        <p className="text-sm text-black/70 mt-1">{t.none}</p>
      </div>
    );
  }

  const startsIn = startsInLabel(next.startTime);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{t.title}</p>
        {startsIn ? (
          <span className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-black/70">
            {startsIn}
          </span>
        ) : null}
      </div>

      <p className="text-lg font-semibold mt-1">{next.role}</p>
      <p className="text-sm text-black/70">{next.eventTitle}</p>

      <p className="text-sm text-black/60 mt-2">
        {fmtStart(next.startTime)} → {fmtEndTime(next.endTime)}
      </p>

      {next.location ? (
        <p className="text-sm text-black/60 mt-1">📍 {next.location}</p>
      ) : null}
    </div>
  );
}
