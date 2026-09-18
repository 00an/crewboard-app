// app/[locale]/(admin-only)/admin/page.tsx
import RequireRoles from "../../../../components/auth/RequireRoles";
import AdminHomeView from "../../../../components/(admin)/adminHome/AdminHomeview";

export default function AdminPage() {
  return (
    <RequireRoles allow={["ADMIN"]}>
      <AdminHomeView />
    </RequireRoles>
  );
}
