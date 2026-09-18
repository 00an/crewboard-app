// components/(protected)/volunteer/pages/VolunteerShiftsView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getVolunteerDashboardData } from "../../../../services/volunteer/volunteerService";
import type { AssignedShiftDto, VolunteerOpenShift } from "@types";
import OpenShiftsSection from "../OpenShiftsSection";
import AssignedShiftsSection from "../AssignedShiftsSection";
import Loading from "../../../ui/Loading";
import { useCommonText } from "../../../../i18n/common";

export default function VolunteerShiftsView() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale);

  const [assignedShifts, setAssignedShifts] = useState<AssignedShiftDto[]>([]);
  const [openShifts, setOpenShifts] = useState<VolunteerOpenShift[]>([]);
  const [dismissedShifts, setDismissedShifts] = useState<VolunteerOpenShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVolunteerDashboardData();
      setAssignedShifts(data.assignedShifts);
      setOpenShifts(data.openShifts);
      setDismissedShifts(data.dismissedOpenShifts);
    } catch (e) {
      setError((e as Error).message || t.volunteerShiftsPage.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch-on-mount: this effect's only job is to kick off the initial
    // load and let the async function's own try/finally set loading and
    // error/data state once the request resolves — the standard pattern
    // for a component with no data-fetching library in front of it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // `load` is intentionally left out of the dependency array: it's a new
    // function identity every render (it's also reused by the Refresh
    // button and passed down as onChanged), so including it would re-run
    // this effect on every render instead of once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{t.volunteerShiftsPage.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.volunteerShiftsPage.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
          >
            {loading ? t.volunteerShiftsPage.refreshing : t.volunteerShiftsPage.refresh}
          </button>
          <Link
            href={`/${locale}/volunteer`}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5"
          >
            {t.volunteerShiftsPage.backToDashboard}
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loading label={t.volunteerShiftsPage.loadingShifts} size="lg" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AssignedShiftsSection shifts={assignedShifts} onChanged={load} />
          <OpenShiftsSection
            shifts={openShifts}
            dismissedShifts={dismissedShifts}
            onChanged={load}
          />
        </div>
      )}
    </main>
  );
}
