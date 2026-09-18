// app/[locale]/(open)/layout.tsx
import type { ReactNode } from "react";
import OpenNavbar from "../../../components/layout/navbars/OpenNavBar";

export default function OpenLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OpenNavbar />
      {children}
    </>
  );
}
