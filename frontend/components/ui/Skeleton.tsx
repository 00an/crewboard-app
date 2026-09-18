// components/ui/Skeleton.tsx
export default function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
      ))}
    </div>
  );
}
