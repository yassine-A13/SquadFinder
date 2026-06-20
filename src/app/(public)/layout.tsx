import type { ReactNode } from "react";

import { SiteShell } from "@/components/shared/site-shell";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      description="Routes publiques, onboarding, annonces et point d'entree Auth.js."
      title="Trouve ton squad plus vite"
    >
      {children}
    </SiteShell>
  );
}
