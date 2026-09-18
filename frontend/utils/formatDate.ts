// utils/formatDate.ts
//
// Shared date/time formatting for anything the backend sends as a raw ISO
// LocalDateTime string (e.g. "2026-09-25T09:00:00"). Several components used
// to render that string directly, which is why the UI sometimes showed raw
// timestamps (down to the microsecond) instead of a readable date.

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // fall back to the raw value rather than "Invalid Date"

  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDateRange(startIso: string, endIso: string): string {
  return `${fmtDateTime(startIso)} → ${fmtDateTime(endIso)}`;
}
