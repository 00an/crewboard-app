// services/shifts/shiftService.ts
import type { AdminShift, NewAdminShift } from "@types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

/**
 * Get all shifts for a specific event
 */
async function getShiftsForEvent(eventId: string): Promise<AdminShift[]> {
  const res = await fetch(api(`/api/events/${eventId}/shifts`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch shifts (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}

/**
 * Add a new shift to an event. Backend is responsible for generating the ID.
 */
async function addShift(
  eventId: string,
  newShift: NewAdminShift
): Promise<AdminShift> {
  const res = await fetch(api(`/api/events/${eventId}/shifts`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newShift),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to add shift (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}

/**
 * Update an existing shift's editable fields.
 */
async function updateShift(
  eventId: string,
  shiftId: number,
  updated: NewAdminShift
): Promise<AdminShift> {
  const res = await fetch(api(`/api/events/${eventId}/shifts/${shiftId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update shift (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}

const shiftService = {
  getShiftsForEvent,
  addShift,
  updateShift,
};

export default shiftService;
