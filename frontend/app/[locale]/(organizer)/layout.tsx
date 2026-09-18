// app/[locale]/(organizer)/organizer/layout.tsx
import type { ReactNode } from "react";
import OrganizerNavbar from "../../../components/layout/navbars/OrganizerNavBar";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OrganizerNavbar />
      {children}
    </>
  );
}
