// app/[locale]/(admin-only)/layout.tsx
import type { ReactNode } from "react";
import AdminNavbar from "../../../components/layout/navbars/AdminNavBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
