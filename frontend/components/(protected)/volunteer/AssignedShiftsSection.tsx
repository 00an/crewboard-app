// components/volunteer/AssignedShiftsSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { AssignedShiftDto } from "../../../types";
import Section from "../../ui/Section";
import EmptyState from "../../ui/EmptyState";
import { leaveAssignment } from "../../../services/volunteer/volunteerService";
import { useCommonText, type CommonText } from "../../../i18n/common";

function isPast(endIso: string) {
  const t = new Date(endIso).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

function fmtRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startText = start.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endText = end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startText} – ${endText}`;
}

function AssignedShiftCard({
  shift,
  leaving,
  onLeave,
  t,
}: {
  shift: AssignedShiftDto;
  leaving: boolean;
  onLeave: () => void;
  t: CommonText["assignedShifts"];
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {shift.role}
            <span className="text-black/50 font-normal"> • {shift.eventTitle}</span>
          </p>

          <p className="text-xs text-black/60 mt-1">
            {fmtRange(shift.startTime, shift.endTime)}
          </p>

          {shift.location ? (
            <p className="text-xs text-black/60 mt-1">📍 {shift.location}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLeave}
          disabled={leaving}
          className="shrink-0 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
        >
          {leaving ? t.leaving : t.leave}
        </button>
      </div>
    </div>
  );
}

export default function AssignedShiftsSection({
  shifts,
  onChanged,
  onLeftToOpen,
}: {
  shifts: AssignedShiftDto[];
  onChanged?: () => void; // refresh callback
  onLeftToOpen?: (left: AssignedShiftDto) => void; // ✅ move to Open shifts optimistically
}) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale).assignedShifts;

  const [leavingId, setLeavingId] = useState<number | null>(null);
  const [errorByAssignmentId, setErrorByAssignmentId] = useState<
    Record<number, string | null>
  >({});

  // Optimistic: hide assignments that were just successfully left
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  // If parent refreshes data, clear removed state (keeps UI consistent)
  useEffect(() => {
    setRemovedIds(new Set());
  }, [shifts]);

  const upcoming = useMemo(() => {
    const items = shifts
      .filter((s) => !isPast(s.endTime))
      .filter((s) => !removedIds.has(s.assignmentId));

    items.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    return items;
  }, [shifts, removedIds]);

  const doLeave = async (shift: AssignedShiftDto) => {
    const assignmentId = shift.assignmentId;

    // clear old error for this card
    setErrorByAssignmentId((prev) => ({ ...prev, [assignmentId]: null }));

    try {
      setLeavingId(assignmentId);
      await leaveAssignment(assignmentId);

      // ✅ instantly hide from the list so user can't click it again
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(assignmentId);
        return next;
      });

      // ✅ instantly push it into Open shifts (optimistic)
      onLeftToOpen?.(shift);

      // ✅ refresh dashboard data from backend (to get real counts, proper event ids, etc.)
      onChanged?.();
    } catch (e) {
      setErrorByAssignmentId((prev) => ({
        ...prev,
        [assignmentId]: (e as Error).message || t.leaveFailed,
      }));
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <Section title={t.title}>
      {upcoming.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
      ) : (
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div key={s.assignmentId}>
              <AssignedShiftCard
                shift={s}
                leaving={leavingId === s.assignmentId}
                onLeave={() => void doLeave(s)}
                t={t}
              />

              {errorByAssignmentId[s.assignmentId] ? (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorByAssignmentId[s.assignmentId]}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
