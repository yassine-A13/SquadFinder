"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type AvatarRingProps = {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | null;
  online?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-28 w-28",
};

function getRingClass(level?: AvatarRingProps["level"], online?: boolean) {
  if (online) return "ring-4 ring-success/80 shadow-soft";

  switch (level) {
    case "BEGINNER":
      return "ring-2 ring-warning/60";
    case "INTERMEDIATE":
      return "ring-2 ring-primary-300";
    case "ADVANCED":
      return "ring-2 ring-success/60";
    case "EXPERT":
      return "ring-2 ring-warning/80";
    default:
      return "ring-2 ring-secondary-200";
  }
}

export function AvatarRing({ src, alt, size = "md", level = null, online = false, className }: AvatarRingProps) {
  const sizes = sizeMap[size] ?? sizeMap.md;

  return (
    <div className={cn("inline-grid place-items-center rounded-full", getRingClass(level, online), className)}>
      <Avatar className={cn(sizes, "rounded-full bg-card")}> 
        {src ? <AvatarImage src={src ?? undefined} alt={alt ?? "Avatar"} /> : <AvatarFallback>{(alt ?? "U").slice(0, 2).toUpperCase()}</AvatarFallback>}
      </Avatar>
    </div>
  );
}

export default AvatarRing;
