// app/[locale]/(admin-only)/events/[eventId]/shifts/page.tsx
import RequireRoles from "../../../../../../components/auth/RequireRoles";
import ShiftList from "../../../../../../components/(admin)/shifts/ShiftList";

export default function EventShiftsPage() {
  return (
    <RequireRoles allow={["ORGANIZER", "ADMIN"]}>
      <ShiftList />
    </RequireRoles>
  );
}
