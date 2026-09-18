// services/volunteer/volunteerService.ts
import type { VolunteerDashboardData } from "../../types";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

/**
 * Dashboard endpoint that returns everything the volunteer needs:
 * - assignedShifts: AssignedShiftDto[]
 * - openShifts: VolunteerOpenShift[]
 * - eventsNeedingHelp: EventNeedHelp[]
 */
export async function getVolunteerDashboardData(): Promise<VolunteerDashboardData> {
  const res = await fetchWithAuth(api("/api/volunteer/dashboard"));

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to load volunteer dashboard (${res.status}). ${txt}`);
  }

  return (await res.json()) as VolunteerDashboardData;
}


export async function joinShift(shiftId: number): Promise<void> {
  const res = await fetchWithAuth(api(`/api/volunteer/shifts/${shiftId}/join`), {
    method: "POST",
  });

  if (res.ok) return;

  const txt = await res.text().catch(() => "");

  // backend sends ResponseStatusException messages like:
  // {"message":"..."} or plain text depending on config
  const lower = txt.toLowerCase();

  if (res.status === 409) {
    if (lower.includes("overlaps")) throw new Error("overlaps");
    if (lower.includes("full")) throw new Error("full");
    if (lower.includes("already")) throw new Error("already joined");
    throw new Error("conflict");
  }

  throw new Error(`Join failed (${res.status}). ${txt}`);
}




export async function leaveAssignment(assignmentId: number): Promise<void> {
  const res = await fetchWithAuth(api(`/api/volunteer/assignments/${assignmentId}`), {
    method: "DELETE",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Leave failed (${res.status}). ${txt}`);
  }
}


export async function dismissOpenShift(shiftId: number): Promise<void> {
  const res = await fetchWithAuth(api(`/api/volunteer/availability/${shiftId}/dismiss`), {
    method: "POST",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Couldn't hide shift (${res.status}). ${txt}`);
  }
}

export async function undoDismissOpenShift(shiftId: number): Promise<void> {
  const res = await fetchWithAuth(api(`/api/volunteer/availability/${shiftId}/dismiss`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Couldn't undo (${res.status}). ${txt}`);
  }
}
