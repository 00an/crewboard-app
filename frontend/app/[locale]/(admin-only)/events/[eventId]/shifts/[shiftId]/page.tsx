// app/[locale]/(admin-only)/events/[eventId]/shifts/[shiftId]/page.tsx
import RequireRoles from "../../../../../../../components/auth/RequireRoles";
import ShiftDetail from "../../../../../../../components/(admin)/shifts/ShiftDetails";

export default function ShiftDetailPage() {
  return (
    <RequireRoles allow={["ORGANIZER", "ADMIN"]}>
      <ShiftDetail />
    </RequireRoles>
  );
}
