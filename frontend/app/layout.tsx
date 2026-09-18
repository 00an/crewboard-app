// app/layout.tsx
import type { ReactNode } from "react";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        {/* Global page wrapper */}
        <div className="flex min-h-screen flex-col">
          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Global footer */}
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} CrewBoard
          </footer>
        </div>
      </body>
    </html>
  );
}
