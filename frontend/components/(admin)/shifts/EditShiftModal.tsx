"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminShift, NewAdminShift } from "@types";
import { useCommonText } from "../../../i18n/common";

interface EditShiftModalProps {
  shift: AdminShift | null;
  onClose: () => void;
  onSave: (shiftId: number, updated: NewAdminShift) => Promise<void> | void;
}

type FormState = {
  role: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  headcount: number | "";
};

function toFormState(shift: AdminShift): FormState {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  return {
    role: shift.role,
    location: shift.location ?? "",
    date: dateStr,
    startTime: startStr,
    endTime: endStr,
    headcount: shift.headcount,
  };
}

export default function EditShiftModal({
  shift,
  onClose,
  onSave,
}: EditShiftModalProps) {
  const params = useParams<{ locale: string }>();
  const t = useCommonText(params?.locale);

  // The parent keys this component by shift id, so a fresh instance (and
  // fresh initial state below) is mounted whenever a different shift is
  // opened — no effect needed to re-derive form state from the prop.
  const [form, setForm] = useState<FormState | null>(shift ? toFormState(shift) : null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!shift || !form) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) =>
      prev
        ? { ...prev, [name]: name === "headcount" ? (value === "" ? "" : Number(value)) : value }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");

    if (!form.role || !form.date || !form.startTime || !form.endTime || !form.headcount) {
      setError(t.shiftForm.errFillRequired);
      return;
    }
    if (new Date(`${form.date}T${form.endTime}`) <= new Date(`${form.date}T${form.startTime}`)) {
      setError(t.shiftForm.errEndAfterStart);
      return;
    }

    const payload: NewAdminShift = {
      role: form.role.trim(),
      location: form.location.trim() || null,
      startTime: `${form.date}T${form.startTime}:00`,
      endTime: `${form.date}T${form.endTime}:00`,
      headcount: Number(form.headcount),
    };

    try {
      setSaving(true);
      await onSave(shift.id, payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || t.shiftForm.errFailedToSave);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label={t.shiftForm.close}
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          {t.shiftForm.editTitle}
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldRole}</label>
            <input
              name="role"
              type="text"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldLocation}</label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldDate}</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldHeadcount}</label>
              <input
                name="headcount"
                type="number"
                min={1}
                value={form.headcount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldStartTime}</label>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">{t.shiftForm.fieldEndTime}</label>
              <input
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            {saving ? t.shiftForm.savingButton : t.shiftForm.saveButton}
          </button>
        </form>
      </div>
    </div>
  );
}
