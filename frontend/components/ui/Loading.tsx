// components/ui/Loading.tsx

type Props = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export default function Loading({ label = "Loading…", size = "md" }: Props) {
  return (
    <div className="flex items-center gap-2 text-black/60">
      <span
        className={`inline-block animate-spin rounded-full border-black/20 border-t-black/70 ${sizeMap[size]}`}
        aria-hidden
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
