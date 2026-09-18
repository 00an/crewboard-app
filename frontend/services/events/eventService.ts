// services/events/eventService.ts
import type { Event } from "@types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

async function getAllEvents(): Promise<Event[]> {
  const res = await fetch(api("/api/events"), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch events (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}

async function getEventById(eventId: string): Promise<Event> {
  const res = await fetch(api(`/api/events/${eventId}`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch event ${eventId} (${res.status}): ${text || "no body"}`
    );
  }

  return res.json();
}

async function addEvent(newEvent: Omit<Event, "id">): Promise<Event> {
  const res = await fetch(api("/api/events"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newEvent),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to add event (${res.status}): ${text || "no body"}`);
  }

  return res.json();
}



const EventService = { getAllEvents, getEventById, addEvent };
export default EventService;
