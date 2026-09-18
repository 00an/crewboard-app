// components/events/EventItem.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Event } from "@types";
import { fmtDateRange } from "../../../utils/formatDate";
import { useCommonText } from "../../../i18n/common";

interface EventItemProps {
  event: Event;
}

export default function EventItem({ event }: EventItemProps) {
  const [open, setOpen] = useState(false);
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white transition hover:bg-gray-50">
      <div
        className="cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
      >
        <div className="flex justify-between items-center gap-3">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {fmtDateRange(event.startDate, event.endDate)}
          </span>
        </div>
        <p className="text-gray-600">{event.location}</p>

        {open && (
          <div className="mt-2 border-t pt-2 text-sm text-gray-700">
            <p>{event.description}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-3 text-sm">
        <Link className="underline" href={`/${locale}/events/${event.id}`}>
          {t.events.details}
        </Link>
        <Link className="underline" href={`/${locale}/events/${event.id}/shifts`}>
          {t.events.shifts}
        </Link>
      </div>
    </div>
  );
}
