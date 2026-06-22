import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const statusStyles = {
  ACCEPTED: { label: "Acceptée", icon: CheckCircle2, className: "bg-success-50 text-success-700 ring-success-200" },
  OPEN: { label: "Ouverte", icon: CheckCircle2, className: "bg-success-50 text-success-700 ring-success-200" },
  PENDING: { label: "En attente", icon: Clock3, className: "bg-warning-50 text-warning-700 ring-warning-200" },
  REJECTED: { label: "Refusée", icon: XCircle, className: "bg-danger-50 text-danger-700 ring-danger-200" },
  CLOSED: { label: "Fermée", icon: XCircle, className: "bg-secondary-100 text-secondary-600 ring-secondary-200" },
} as const;

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const visual = statusStyles[status as keyof typeof statusStyles] ?? statusStyles.PENDING;
  const Icon = visual.icon;
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset transition-colors duration-300", visual.className, className)}><Icon className="size-3.5" />{visual.label}</span>;
}
