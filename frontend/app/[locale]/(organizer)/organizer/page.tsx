// app/[locale]/(organizer)/organizer/page.tsx
import RequireRoles from "../../../../components/auth/RequireRoles";
import OrganizerHomeView from "../../../../components/(organizer)/organizerHome/OrganizerHomeView";

export default function OrganizerPage() {
  return (
    <RequireRoles allow={["ORGANIZER"]}>
      <OrganizerHomeView />
    </RequireRoles>
  );
}
