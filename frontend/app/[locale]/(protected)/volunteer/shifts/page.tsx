// app/[locale]/(protected)/volunteer/shifts/page.tsx
import RequireRoles from "../../../../../components/auth/RequireRoles";
import VolunteerShiftsView from "../../../../../components/(protected)/volunteer/pages/VolunteerShiftsView";

export default function VolunteerShiftsPage() {
  return (
    <RequireRoles allow={["VOLUNTEER"]}>
      <VolunteerShiftsView />
    </RequireRoles>
  );
}
