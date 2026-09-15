import { cn } from "@/lib/utils";

/** Small neutral chip marking a Plus feature. */
export function PlusBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-px text-[10px] font-semibold uppercase leading-4 tracking-wide text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
