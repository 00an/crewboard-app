"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { NewAdminShift, AdminShift } from "@types";
import ShiftService from "../../../services/shifts/shiftService";
import { useCommonText } from "../../../i18n/common";

interface AddShiftFormProps {
  onAddShift?: (newShift: AdminShift) => void;
}

export default function AddShiftForm({ onAddShift }: AddShiftFormProps) {
  const params = useParams<{ locale: string; eventId: string }>();
  const eventId = params?.eventId;
  const t = useCommonText(params?.locale);

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [headcount, setHeadcount] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Validation ---
    if (!role || !location || !date || !startTime || !endTime || !headcount) {
      setError(t.shiftForm.errFillRequired);
      return;
    }

    const count = Number(headcount);
    if (count <= 0) {
      setError(t.shiftForm.errHeadcountPositive);
      return;
    }

    if (new Date(`${date}T${endTime}`) <= new Date(`${date}T${startTime}`)) {
      setError(t.shiftForm.errEndAfterStart);
      return;
    }

    if (!eventId) {
      setError(t.shiftForm.errEventIdMissing);
      return;
    }

    setLoading(true);
    try {
      const payload: NewAdminShift = {
        role,
        location,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        headcount: count,
      };

      const createdShift = await ShiftService.addShift(eventId, payload);

      // Reset form
      setRole("");
      setLocation("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setHeadcount("");

      if (onAddShift) {
        onAddShift(createdShift);
      }
    } catch (err: any) {
      setError(err.message || t.shiftForm.errFailedToAdd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-gray-50 rounded-2xl shadow-md mb-6"
    >
      <h2 className="text-xl font-semibold text-blue-700 mb-4">{t.shiftForm.addTitle}</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldRole}</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder={t.shiftForm.rolePlaceholder}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldLocationRequired}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder={t.shiftForm.locationPlaceholder}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldDate}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldStartTime}</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldEndTime}</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            {t.shiftForm.fieldHeadcount}
          </label>
          <input
            type="number"
            min={1}
            value={headcount}
            onChange={(e) => setHeadcount(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? t.shiftForm.addingButton : t.shiftForm.addButton}
      </button>
    </form>
  );
}
