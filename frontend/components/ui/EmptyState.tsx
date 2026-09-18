// components/ui/EmptyState.tsx
type Props = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/70">
      <p className="font-medium text-black">{title}</p>
      {description ? <p className="mt-1">{description}</p> : null}
    </div>
  );
}
