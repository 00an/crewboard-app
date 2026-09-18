// app/[locale]/(admin-only)/admin/users/page.tsx
import RequireRoles from "../../../../../components/auth/RequireRoles";
import AdminUsersView from "../../../../../components/(admin)/users/AdminUsersView";

export default function AdminUsersPage() {
  return (
    <RequireRoles allow={["ADMIN"]}>
      <AdminUsersView />
    </RequireRoles>
  );
}
