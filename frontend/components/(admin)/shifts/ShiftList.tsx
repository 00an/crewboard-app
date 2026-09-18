"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { AdminShift, NewAdminShift } from "@types";
import AddShiftForm from "./AddShiftForm";
import EditShiftModal from "./EditShiftModal";
import shiftService from "../../../services/shifts/shiftService";
import { useCommonText } from "../../../i18n/common";

function fmtShiftTime(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const startStr = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endStr = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} — ${startStr} → ${endStr}`;
}

export default function ShiftList() {
  const params = useParams<{ locale: string; eventId: string }>();
  const locale = params?.locale ?? "en";
  const eventId = params?.eventId;
  const t = useCommonText(locale);

  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingShift, setEditingShift] = useState<AdminShift | null>(null);

  useEffect(() => {
    if (!eventId) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedShifts = await shiftService.getShiftsForEvent(eventId);
        setShifts(fetchedShifts);
      } catch (err: any) {
        setError(err?.message || t.shiftList.failedToLoad);
        setShifts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, t.shiftList.failedToLoad]);

  const handleEditShift = (shift: AdminShift) => setEditingShift(shift);

  const handleSaveShift = async (shiftId: number, updated: NewAdminShift) => {
    if (!eventId) return;
    const saved = await shiftService.updateShift(eventId, shiftId, updated);
    setShifts((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <section className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">{t.shiftList.title}</h1>
            <p className="text-gray-600 mt-1">{t.shiftList.eventIdLabel(eventId || "…")}</p>
          </div>

          <Link
            href={`/${locale}/events/${eventId}`}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            {t.shiftList.backToEvent}
          </Link>
        </div>

        <AddShiftForm onAddShift={(s) => setShifts((prev) => [...prev, s])} />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {loading ? (
          <p className="text-gray-500 mt-4">{t.shiftList.loading}</p>
        ) : shifts.length > 0 ? (
          <ul className="space-y-3 mt-6">
            {shifts.map((shift) => (
              <li
                key={shift.id}
                className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {shift.role}
                  </h3>

                  <p className="text-gray-600">
                    📅 {fmtShiftTime(shift.startTime, shift.endTime)}
                  </p>

                  {shift.location ? (
                    <p className="text-gray-700">📍 {shift.location}</p>
                  ) : null}

                  <p className="text-gray-700">
                    👥 {t.shiftList.peopleRequired}{" "}
                    <span className="font-medium">{shift.headcount}</span>
                  </p>

                  <div className="mt-2 flex gap-3 text-sm">
                    <Link
                      className="underline"
                      href={`/${locale}/events/${eventId}/shifts/${shift.id}`}
                    >
                      {t.shiftList.viewDetails}
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => handleEditShift(shift)}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
                >
                  {t.shiftList.edit}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic mt-4">{t.shiftList.empty}</p>
        )}

        {editingShift && (
          <EditShiftModal
            // Keying by shift id forces a fresh mount whenever a different
            // shift is opened, so the form starts from that shift's data
            // without needing a useEffect to re-derive state from props.
            key={editingShift.id}
            shift={editingShift}
            onClose={() => setEditingShift(null)}
            onSave={handleSaveShift}
          />
        )}
      </section>
    </main>
  );
}
