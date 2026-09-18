// components/ui/Section.tsx
import type { ReactNode } from "react";

type Props = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Section({ title, right, children, className }: Props) {
  return (
    <section className={["rounded-2xl border border-black/10 bg-white p-4", className].filter(Boolean).join(" ")}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}
