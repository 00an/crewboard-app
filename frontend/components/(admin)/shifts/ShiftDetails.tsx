"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { AdminShift } from "@types";
import ShiftService from "../../../services/shifts/shiftService";
import { useCommonText } from "../../../i18n/common";

function fmtRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const startStr = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endStr = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${dateStr}, ${startStr} → ${endStr}`;
}

export default function ShiftDetail() {
  const params = useParams<{ locale: string; eventId: string; shiftId: string }>();
  const locale = params?.locale ?? "en";
  const eventId = params?.eventId;
  const shiftIdStr = params?.shiftId;
  const t = useCommonText(locale);

  const shiftId = useMemo(() => {
    const n = Number(shiftIdStr);
    return Number.isFinite(n) ? n : null;
  }, [shiftIdStr]);

  const [shift, setShift] = useState<AdminShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !shiftIdStr) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        if (shiftId == null) {
          setShift(null);
          setError(t.shiftDetails.invalidShiftId);
          return;
        }

        // Fetch all shifts for the event from backend
        const shifts = await ShiftService.getShiftsForEvent(eventId);
        const found = shifts.find((s) => s.id === shiftId) || null;

        setShift(found);
      } catch (e: any) {
        setError(e?.message || t.shiftDetails.failedToLoad);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, shiftId, shiftIdStr, t.shiftDetails.invalidShiftId, t.shiftDetails.failedToLoad]);

  if (loading) {
    return <p className="p-6">{t.shiftDetails.loadingShift}</p>;
  }

  if (error) {
    return (
      <main className="p-6 space-y-4">
        <p className="text-red-600">{error}</p>
        <div className="flex gap-3">
          <Link className="underline" href={`/${locale}/events/${eventId}/shifts`}>
            {t.shiftDetails.backToShifts}
          </Link>
          <Link className="underline" href={`/${locale}/events/${eventId}`}>
            {t.shiftDetails.backToEventLink}
          </Link>
        </div>
      </main>
    );
  }

  if (!shift) {
    return (
      <main className="p-6 space-y-4">
        <p>{t.shiftDetails.shiftNotFound}</p>
        <div className="flex gap-3">
          <Link className="underline" href={`/${locale}/events/${eventId}/shifts`}>
            {t.shiftDetails.backToShifts}
          </Link>
          <Link className="underline" href={`/${locale}/events/${eventId}`}>
            {t.shiftDetails.backToEventLink}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{t.shiftDetails.title}</h1>
        <p className="text-gray-600">
          {t.shiftDetails.eventLabel} <span className="font-medium">{eventId}</span> —{" "}
          {t.shiftDetails.shiftLabel}{" "}
          <span className="font-medium">{shiftIdStr}</span>
        </p>
      </header>

      <section className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div>
          <p className="text-sm text-gray-500">{t.shiftDetails.roleLabel}</p>
          <p className="text-lg font-semibold">{shift.role}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">{t.shiftDetails.dateTimeLabel}</p>
          <p className="text-gray-800">📅 {fmtRange(shift.startTime, shift.endTime)}</p>
        </div>

        {shift.location ? (
          <div>
            <p className="text-sm text-gray-500">{t.shiftDetails.locationLabel}</p>
            <p className="text-gray-800">{shift.location}</p>
          </div>
        ) : null}

        <div>
          <p className="text-sm text-gray-500">{t.shiftDetails.peopleRequiredLabel}</p>
          <p className="text-gray-800">{shift.headcount}</p>
        </div>
      </section>

      <div className="flex gap-3">
        <Link
          href={`/${locale}/events/${eventId}/shifts`}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          {t.shiftDetails.backToShifts}
        </Link>

        <Link
          href={`/${locale}/events/${eventId}`}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          {t.shiftDetails.backToEventLink}
        </Link>
      </div>
    </main>
  );
}
