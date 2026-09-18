// types/index.ts

/* =========================
   AUTH / USER
   ========================= */

export type User = {
  email: string;
  role?: Role;
};

/**
 * What /api/auth/me typically returns
 * (keep this in sync with your backend response)
 */
export type Me = {
  email: string;
  role: Role;
  roles?: Role[];
};

export type RoleName = "ADMIN" | "ORGANIZER" | "VOLUNTEER";
export type Role = "ADMIN" | "ORGANIZER" | "VOLUNTEER";

/**
 * Mirrors the backend's UserSummaryDto — returned by GET /api/admin/users.
 */
export type AdminUserSummary = {
  id: number;
  email: string;
  username: string;
  enabled: boolean;
  roles: string[];
};

/* =========================
   EVENTS
   ========================= */

export type Event = {
  id: number;
  title: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: string;
  description: string;
};

export type EventSummary = {
  id: number;
  title: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location?: string | null;

  /**
   * Used in volunteer dashboard "events needing help"
   */
  openShiftCount?: number;
};

/**
 * Used when creating a new event (no id yet)
 */
export type NewEvent = Omit<Event, "id">;

/* =========================
   SHIFTS (generic app types)
   ========================= */

/**
 * Shift shape used by the organizer/admin event-management UI.
 * Matches the backend's ShiftResponse exactly (id, role, location,
 * ISO startTime/endTime, headcount) — there is no `date` or
 * `assignedTo` field on the backend, so neither exists here.
 */
export interface AdminShift {
  id: number;
  role: string;
  location: string | null;
  startTime: string; // ISO
  endTime: string; // ISO
  headcount: number;
}

export type NewAdminShift = Omit<AdminShift, "id">;

/**
 * Legacy shift summary type (NOT used for the volunteer dashboard).
 * Keep it if you still use it in organizer/admin UI.
 */
export type ShiftSummary = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
  assignedCount?: number;
  event: EventSummary;
  myAssignmentId?: number | null;
  status?: "UPCOMING" | "ONGOING" | "DONE";
};

/* =========================
   VOLUNTEER DASHBOARD (matches backend DTOs)
   ========================= */

/**
 * Backend: AssignedShiftDto
 */
export type AssignedShiftDto = {
  assignmentId: number;
  shiftId: number;
  eventTitle: string;
  role: string;
  startTime: string; // ISO
  endTime: string; // ISO
  location?: string | null;
};

/**
 * Backend: ShiftSummaryDto (for open shifts)
 */
export type VolunteerOpenShift = {
  id: number; // shift id
  role: string;
  location?: string | null;
  startTime: string; // ISO
  endTime: string; // ISO

  // from backend normally, but optional for optimistic placeholder
  headcount?: number;
  assignedCount?: number;

  myAssignmentId?: number | null;
  event: EventSummary;
};

/**
 * Backend: EventNeedHelpDto
 * (separate from EventSummary so openShiftCount is required here)
 */
export type EventNeedHelp = {
  id: number;
  title: string;
  startDate: string; // ISO
  endDate: string; // ISO
  location?: string | null;
  openShiftCount: number;
};

/**
 * Backend: VolunteerDashboardDto
 */
export type VolunteerDashboardData = {
  assignedShifts: AssignedShiftDto[];
  openShifts: VolunteerOpenShift[];
  dismissedOpenShifts: VolunteerOpenShift[];
  eventsNeedingHelp: EventNeedHelp[];
};