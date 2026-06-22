import { cn } from "@/lib/utils";
import { getSportVisual } from "@/lib/sport-icons";

export function SportBadge({ sport, className }: { sport: string; className?: string }) {
  const { icon: Icon, className: colors } = getSportVisual(sport);

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset", colors, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {sport}
    </span>
  );
}
