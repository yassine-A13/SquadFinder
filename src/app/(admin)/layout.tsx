import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { SiteShell } from "@/components/shared/site-shell";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <SiteShell
      description="Espace admin pour moderer les annonces, utilisateurs et contenus."
      title="Administration"
    >
      {children}
    </SiteShell>
  );
}
