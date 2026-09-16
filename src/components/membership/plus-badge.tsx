import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Two jobs, two looks:
 *   "member"  — you have Plus. Solid, high contrast, with a small mark: it is a
 *               status, and it should feel like one.
 *   "feature" — this is a Plus feature you don't have yet. Quiet outline, so it
 *               labels the row without shouting over it.
 *
 * Both stay in MojiCap's neutral palette — no accent colour anywhere else on
 * the site, and none here.
 */
export function PlusBadge({
  label,
  variant = "feature",
  className,
}: {
  label: string;
  variant?: "member" | "feature";
  className?: string;
}) {
  const member = variant === "member";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full text-[10px] font-semibold uppercase leading-4 tracking-[0.08em]",
        member
          ? "bg-foreground px-2 py-0.5 text-background shadow-sm"
          : "border border-border/80 px-1.5 py-px text-muted-foreground",
        className,
      )}
    >
      {member && <Sparkles className="h-2.5 w-2.5" aria-hidden />}
      {label}
    </span>
  );
}
