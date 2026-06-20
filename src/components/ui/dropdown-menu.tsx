"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DropdownMenu({ children }: { children: ReactNode }) {
  return <div className="relative inline-flex">{children}</div>;
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm hover:bg-muted",
        className,
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = "end",
  children,
}: {
  align?: "start" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const childrenArray = Array.isArray(children) ? children : [children];
  const [trigger, content] = childrenArray;

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <span onClick={() => setOpen((current) => !current)}>{trigger}</span>
      {open ? (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 min-w-44 rounded-xl border border-border bg-popover p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div onClick={() => setOpen(false)}>{content}</div>
        </div>
      ) : null}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-9 items-center rounded-lg px-3 text-sm text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
