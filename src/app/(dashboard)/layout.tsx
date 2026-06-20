import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { SiteShell } from "@/components/shared/site-shell";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SiteShell
      description="Zone joueur authentifiee. Protegee cote serveur avec Auth.js."
      title="Dashboard joueur"
    >
      {children}
    </SiteShell>
  );
}
