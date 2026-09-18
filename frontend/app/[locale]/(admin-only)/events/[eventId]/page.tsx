// app/[locale]/(admin-only)/events/[eventId]/page.tsx
import RequireRoles from "../../../../../components/auth/RequireRoles";
import EventDetail from "../../../../../components/(admin)/events/EventDetail";

export default function EventDetailPage() {
  return (
    <RequireRoles allow={["ORGANIZER", "ADMIN"]}>
      <EventDetail />
    </RequireRoles>
  );
}
