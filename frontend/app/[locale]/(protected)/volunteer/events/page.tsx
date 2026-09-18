// app/[locale]/(protected)/volunteer/events/page.tsx
import RequireRoles from "../../../../../components/auth/RequireRoles";
import VolunteerEventsView from "../../../../../components/(protected)/volunteer/pages/VolunteerEventsView";

export default function VolunteerEventsPage() {
  return (
    <RequireRoles allow={["VOLUNTEER"]}>
      <VolunteerEventsView />
    </RequireRoles>
  );
}
