// app/[locale]/(protected)/dashboard/page.tsx
import RequireRoles from "../../../../components/auth/RequireRoles";
import VolunteerDashboardView from "../../../../components/(protected)/dashboard/VolunteerDashboardView";

export default function DashboardPage() {
  return (
    <RequireRoles allow={["VOLUNTEER"]}>
      <VolunteerDashboardView />
    </RequireRoles>
  );
}
