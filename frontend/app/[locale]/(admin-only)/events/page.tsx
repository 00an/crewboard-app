// app/[locale]/(admin-only)/events/page.tsx
import RequireRoles from "../../../../components/auth/RequireRoles";
import EventsView from "../../../../components/(admin)/events/EventView";

export default function EventsPage() {
  return (
    <RequireRoles allow={["ORGANIZER", "ADMIN"]}>
      <EventsView />
    </RequireRoles>
  );
}
