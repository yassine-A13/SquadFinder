"use client";

import { X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Sheet({ trigger, children, title = "Navigation", className }: { trigger: ReactNode; children: ReactNode; title?: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm animate-in fade-in" aria-label="Fermer la navigation" onClick={() => setOpen(false)} />
          <aside className={cn("surface-dark absolute inset-y-0 right-0 w-[min(88vw,22rem)] p-6 shadow-2xl animate-in slide-in-from-right duration-300", className)}>
            <div className="mb-8 flex items-center justify-between">
              <p className="font-heading text-lg font-bold">{title}</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-secondary-300 transition hover:bg-white/10 hover:text-white" aria-label="Fermer"><X className="size-5" /></button>
            </div>
            <div onClick={() => setOpen(false)}>{children}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
