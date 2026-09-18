// app/[locale]/(admin-only)/admin/settings/page.tsx
import RequireRoles from "../../../../../components/auth/RequireRoles";
import AdminSettingsView from "../../../../../components/(admin)/settings/AdminSettingsView";

export default function AdminSettingsPage() {
  return (
    <RequireRoles allow={["ADMIN"]}>
      <AdminSettingsView />
    </RequireRoles>
  );
}
