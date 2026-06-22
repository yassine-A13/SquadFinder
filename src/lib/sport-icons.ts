import { Activity, Bike, CircleDot, Dumbbell, Goal, Waves, type LucideIcon } from "lucide-react";

type SportVisual = { icon: LucideIcon; className: string };

const sportVisuals: Array<[string[], SportVisual]> = [
  [["football", "foot", "soccer", "futsal"], { icon: Goal, className: "bg-emerald-50 text-emerald-700 ring-emerald-200" }],
  [["basket", "basketball"], { icon: CircleDot, className: "bg-orange-50 text-orange-700 ring-orange-200" }],
  [["tennis", "padel", "badminton"], { icon: Activity, className: "bg-lime-50 text-lime-700 ring-lime-200" }],
  [["velo", "vélo", "cycling", "cyclisme"], { icon: Bike, className: "bg-sky-50 text-sky-700 ring-sky-200" }],
  [["natation", "swim", "water"], { icon: Waves, className: "bg-cyan-50 text-cyan-700 ring-cyan-200" }],
  [["fitness", "musculation", "crossfit"], { icon: Dumbbell, className: "bg-violet-50 text-violet-700 ring-violet-200" }],
];

const fallback: SportVisual = { icon: Activity, className: "bg-primary-50 text-primary-700 ring-primary-200" };

export function getSportVisual(sport: string): SportVisual {
  const normalized = sport.trim().toLocaleLowerCase("fr");
  return sportVisuals.find(([names]) => names.some((name) => normalized.includes(name)))?.[1] ?? fallback;
}
