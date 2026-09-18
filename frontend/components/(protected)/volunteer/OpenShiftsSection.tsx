// components/volunteer/OpenShiftsSection.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { VolunteerOpenShift } from "../../../types";
import Section from "../../ui/Section";
import EmptyState from "../../ui/EmptyState";
import {
  joinShift,
  dismissOpenShift,
  undoDismissOpenShift,
} from "../../../services/volunteer/volunteerService";
import { useCommonText, type CommonText } from "../../../i18n/common";

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

function parseNiceError(msg: string, t: CommonText["openShifts"]) {
  const m = msg.toLowerCase();
  if (m.includes("overlaps")) return t.errOverlap;
  if (m.includes("full")) return t.errFull;
  if (m.includes("already joined")) return t.errAlreadyJoined;
  if (m.includes("volunteer not found")) return t.errNoProfile;
  return t.errGeneric;
}

function ShiftCard({
  shift,
  mode,
  busy,
  errorText,
  onJoin,
  onDismiss,
  onUndo,
  t,
}: {
  shift: VolunteerOpenShift;
  mode: "open" | "dismissed";
  busy: boolean;
  errorText: string | null;
  onJoin: () => void;
  onDismiss: () => void;
  onUndo: () => void;
  t: CommonText["openShifts"];
}) {
  const assigned = shift.assignedCount ?? 0;
  const headcount = shift.headcount ?? 1;
  const left = Math.max(0, headcount - assigned);
  const isFull = left <= 0;

  const where = shift.location ?? shift.event.location ?? null;
  const dismissed = mode === "dismissed";

  return (
    <div
      className={[
        "rounded-xl border p-3 transition",
        dismissed
          ? "border-black/5 bg-gray-100 text-black/60"
          : "border-black/10 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {shift.role}
            <span className="text-black/50 font-normal"> • {shift.event.title}</span>
          </p>

          <p className="text-xs text-black/60 mt-1">
            {fmtRange(shift.startTime, shift.endTime)}
          </p>

          <p className="text-xs text-black/60 mt-1">
            👥 {shift.assignedCount}/{shift.headcount} {t.assignedLabel}
            <span className="text-black/40"> • </span>
            {isFull ? (
              <span className="text-black/60">{t.full}</span>
            ) : (
              <span className="text-black/60">{t.spotsLeft(left)}</span>
            )}
          </p>

          {where ? <p className="text-xs text-black/60 mt-1">📍 {where}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            type="button"
            onClick={onJoin}
            disabled={busy || isFull || dismissed}
            className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
          >
            {busy ? t.working : dismissed ? t.unavailable : isFull ? t.full : t.join}
          </button>

          {mode === "open" ? (
            <button
              type="button"
              onClick={onDismiss}
              disabled={busy}
              className="text-[11px] text-black/50 hover:underline disabled:opacity-60"
            >
              {t.cantAttend}
            </button>
          ) : (
            <button
              type="button"
              onClick={onUndo}
              disabled={busy}
              className="text-[11px] text-black/60 hover:underline disabled:opacity-60"
            >
              {t.undo}
            </button>
          )}
        </div>
      </div>

      {errorText ? (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {errorText}
        </div>
      ) : null}
    </div>
  );
}

export default function OpenShiftsSection({
  shifts,
  dismissedShifts,
  onChanged,
}: {
  shifts: VolunteerOpenShift[];
  dismissedShifts: VolunteerOpenShift[];
  onChanged: () => void;
}) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale).openShifts;

  const [q, setQ] = useState("");
  const [busyShiftId, setBusyShiftId] = useState<number | null>(null);
  const [errorByShiftId, setErrorByShiftId] = useState<Record<number, string | null>>(
    {}
  );

  const clearError = (shiftId: number) =>
    setErrorByShiftId((prev) => ({ ...prev, [shiftId]: null }));

  const run = async (
    shiftId: number,
    fn: () => Promise<void>,
    niceError?: (m: string) => string
  ) => {
    clearError(shiftId);

    try {
      setBusyShiftId(shiftId);
      await fn();
      onChanged();
    } catch (e) {
      const msg = (e as Error).message || t.somethingWrong;
      setErrorByShiftId((prev) => ({
        ...prev,
        [shiftId]: niceError ? niceError(msg) : msg,
      }));
    } finally {
      setBusyShiftId(null);
    }
  };

  const filteredOpen = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return shifts;

    return shifts.filter((s) => {
      const hay = `${s.role} ${s.event.title} ${s.location ?? ""} ${
        s.event.location ?? ""
      }`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, shifts]);

  const filteredDismissed = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return dismissedShifts;

    return dismissedShifts.filter((s) => {
      const hay = `${s.role} ${s.event.title} ${s.location ?? ""} ${
        s.event.location ?? ""
      }`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, dismissedShifts]);

  const hasAny = filteredOpen.length > 0 || filteredDismissed.length > 0;

  return (
    <Section
      title={t.title}
      right={
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            // optional: clear all errors while searching
            // setErrorByShiftId({});
          }}
          placeholder={t.searchPlaceholder}
          className="w-44 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
      }
    >
      {!hasAny ? (
        <EmptyState
          title={t.emptyTitle}
          description={q ? t.emptyDescSearch : t.emptyDescDefault}
        />
      ) : (
        <div className="space-y-2">
          {filteredOpen.map((s) => (
            <ShiftCard
              key={s.id}
              shift={s}
              mode="open"
              busy={busyShiftId === s.id}
              errorText={errorByShiftId[s.id] ?? null}
              onJoin={() => void run(s.id, () => joinShift(s.id), (m) => parseNiceError(m, t))}
              onDismiss={() => void run(s.id, () => dismissOpenShift(s.id))}
              onUndo={() => {}}
              t={t}
            />
          ))}

          {filteredDismissed.length > 0 ? (
            <>
              <div className="pt-3 text-xs text-black/50">{t.cantAttendSection}</div>

              {filteredDismissed.map((s) => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  mode="dismissed"
                  busy={busyShiftId === s.id}
                  errorText={errorByShiftId[s.id] ?? null}
                  onJoin={() => {}}
                  onDismiss={() => {}}
                  onUndo={() => void run(s.id, () => undoDismissOpenShift(s.id))}
                  t={t}
                />
              ))}
            </>
          ) : null}
        </div>
      )}
    </Section>
  );
}
