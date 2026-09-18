// app/[locale]/layout.tsx
import type { ReactNode } from "react";
import { AuthProvider } from "../../components/auth/AuthProvider";

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
