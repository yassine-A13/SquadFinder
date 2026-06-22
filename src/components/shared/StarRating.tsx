"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarRating({ rating, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeRating = hovered ?? rating;

  const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index + 1), []);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isActive = star <= activeRating;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            disabled={readOnly}
            className={cn(
              "transition hover:text-amber-400 focus-visible:outline-none",
              isActive ? "text-amber-500" : "text-muted-foreground",
            )}
          >
            <Star className={cn(sizes[size])} />
          </button>
        );
      })}
    </div>
  );
}
