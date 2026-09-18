// app/[locale]/(protected)/layout.tsx
import type { ReactNode } from "react";
import ProtectedNavbar from "../../../components/layout/navbars/ProtectedNavBar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProtectedNavbar />
      {children}
    </>
  );
}
