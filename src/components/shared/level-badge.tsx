import { BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

const levels = {
  BEGINNER: { label: "Débutant", bars: 1, className: "bg-secondary-100 text-secondary-700 ring-secondary-200" },
  INTERMEDIATE: { label: "Intermédiaire", bars: 2, className: "bg-primary-50 text-primary-700 ring-primary-200" },
  ADVANCED: { label: "Avancé", bars: 3, className: "bg-success-50 text-success-700 ring-success-200" },
  EXPERT: { label: "Expert", bars: 4, className: "bg-warning-50 text-warning-700 ring-warning-200" },
} as const;

export type Level = keyof typeof levels;

export function LevelBadge({ level, className }: { level: string; className?: string }) {
  const visual = levels[level as Level] ?? { label: level, bars: 1, className: levels.BEGINNER.className };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset", visual.className, className)} title={`${visual.bars}/4`}>
      <BarChart3 className="size-3.5" aria-hidden="true" />
      {visual.label}
    </span>
  );
}
