"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Event } from "@types";
import EventService from "../../../services/events/eventService";
import { useCommonText } from "../../../i18n/common";

type NewEventInput = Omit<Event, "id">;

interface AddEventFormProps {
  onAddEvent?: (event: Event) => void;
}

export default function AddEventForm({ onAddEvent }: AddEventFormProps) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale);
  const [form, setForm] = useState<NewEventInput>({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const createdEvent = await EventService.addEvent({
        ...form,
        title: form.title.trim(),

        // 🔑 FIX: convert date → LocalDateTime
        startDate: form.startDate
          ? `${form.startDate}T00:00:00`
          : "",
        endDate: form.endDate
          ? `${form.endDate}T23:59:59`
          : "",
      });

      setForm({
        title: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
      });

      if (onAddEvent) {
        onAddEvent(createdEvent);
      }
    } catch (err: any) {
      setError(err.message || t.events.failedToAddEvent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 rounded-xl p-4 mb-6 shadow-md"
    >
      <h2 className="text-xl font-semibold mb-3">{t.events.addEvent}</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            {t.events.fieldTitle}
          </label>
          <input
            name="title"
            placeholder={t.events.fieldTitle}
            value={form.title}
            onChange={handleChange}
            disabled={loading}
            className="p-2 border rounded w-full min-w-0"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            {t.events.fieldLocation}
          </label>
          <input
            name="location"
            placeholder={t.events.fieldLocation}
            value={form.location}
            onChange={handleChange}
            disabled={loading}
            className="p-2 border rounded w-full min-w-0"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            {t.events.fieldStartDate}
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            disabled={loading}
            className="p-2 border rounded w-full min-w-0"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            {t.events.fieldEndDate}
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            disabled={loading}
            className="p-2 border rounded w-full min-w-0"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 mb-1 text-sm font-medium">
          {t.events.fieldDescription}
        </label>
        <textarea
          name="description"
          placeholder={t.events.fieldDescription}
          value={form.description}
          onChange={handleChange}
          disabled={loading}
          className="p-2 border rounded w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? t.events.addingEvent : t.events.addEventButton}
      </button>
    </form>
  );
}
