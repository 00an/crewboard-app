// components/(protected)/dashboard/dashboardView.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type {
  Me,
  VolunteerDashboardData,
  AssignedShiftDto,
  VolunteerOpenShift,
} from "@types";

import { me } from "../../../services/auth/service";
import { getVolunteerDashboardData } from "../../../services/volunteer/volunteerService";
import { useCommonText } from "../../../i18n/common";

import Skeleton from "../../ui/Skeleton";
import LoadingScreen from "../../ui/LoadingScreen";

import NextShiftCard from "../volunteer/NextShiftCard";
import AssignedShiftsSection from "../volunteer/AssignedShiftsSection";
import OpenShiftsSection from "../volunteer/OpenShiftsSection";
import EventsNeedingHelpSection from "../volunteer/EventsNeedingHelpSection";

export default function VolunteerDashboardView() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const t = useCommonText(locale).volunteerDashboard;

  const [user, setUser] = useState<Me | null>(null);
  const [data, setData] = useState<VolunteerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const d = await getVolunteerDashboardData();
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const u = await me();
      if (cancelled) return;

      if (!u) {
        router.replace(`/${locale}/login?redirectTo=/${locale}/volunteer`);
        return;
      }

      if (u.role === "ADMIN") {
        router.replace(`/${locale}/admin`);
        return;
      }
      if (u.role === "ORGANIZER") {
        router.replace(`/${locale}/organizer`);
        return;
      }

      setUser(u);
      await load();
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  /**
   * Optimistic UI:
   * When user leaves an assigned shift, we immediately remove it from assignedShifts
   * and insert it into openShifts as a placeholder item.
   * Then load() will sync the true open shifts + counts.
   */
  const moveLeftShiftToOpenOptimistic = (left: AssignedShiftDto) => {
    setData((prev) => {
      if (!prev) return prev;

      const assignedShifts = prev.assignedShifts.filter(
        (a) => a.assignmentId !== left.assignmentId
      );

      // If it's already in open list (race / refresh), don't duplicate
      const alreadyOpen = prev.openShifts.some((s) => s.id === left.shiftId);
      if (alreadyOpen) {
        return { ...prev, assignedShifts };
      }

      // Create a minimal VolunteerOpenShift that still renders safely.
      // headcount/assignedCount will be fixed after load().
      const placeholderOpen: VolunteerOpenShift = {
        id: left.shiftId,
        role: left.role,
        location: left.location ?? null,
        startTime: left.startTime,
        endTime: left.endTime,
        // optional in your type (recommended)
        headcount: undefined,
        assignedCount: undefined,
        myAssignmentId: null,
        event: {
          // stable unique placeholder id
          id: -left.shiftId,
          title: left.eventTitle,
          startDate: left.startTime,
          endDate: left.endTime,
          location: left.location ?? null,
        },
      };

      return {
        ...prev,
        assignedShifts,
        openShifts: [placeholderOpen, ...prev.openShifts],
      };
    });
  };

  if (!user) {
    return (
      <LoadingScreen title={t.signingIn} subtitle={t.checkingSession} />
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{t.title}</h1>
            <p className="text-sm text-black/60 mt-1">
              {t.signedInAs} {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
          >
            {refreshing ? t.refreshing : t.refresh}
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {!data ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <Skeleton rows={4} />
            </div>
            <div className="md:col-span-2">
              <Skeleton rows={6} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <NextShiftCard assigned={data.assignedShifts} />
              </div>

              <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                <AssignedShiftsSection
                  shifts={data.assignedShifts}
                  onChanged={load}
                  onLeftToOpen={moveLeftShiftToOpenOptimistic}
                />

                <OpenShiftsSection
                  shifts={data.openShifts}
                  dismissedShifts={data.dismissedOpenShifts}
                  onChanged={load}
                />
              </div>
            </div>

            <EventsNeedingHelpSection events={data.eventsNeedingHelp} />
          </>
        )}
      </div>
    </main>
  );
}
