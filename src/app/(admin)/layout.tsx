import type { ReactNode } from "react";

import Link from "next/link";
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
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface-dark h-fit rounded-2xl p-4 shadow-lift lg:sticky lg:top-24">
          <nav className="space-y-3">
            <Link className="block rounded-xl px-4 py-3 text-sm font-semibold text-secondary-200 transition hover:bg-white/10 hover:text-white" href="/admin">
              Dashboard
            </Link>
            <Link className="block rounded-xl px-4 py-3 text-sm font-semibold text-secondary-200 transition hover:bg-white/10 hover:text-white" href="/admin/users">
              Utilisateurs
            </Link>
            <Link className="block rounded-xl px-4 py-3 text-sm font-semibold text-secondary-200 transition hover:bg-white/10 hover:text-white" href="/admin/posts">
              Annonces
            </Link>
            <Link className="block rounded-xl px-4 py-3 text-sm font-semibold text-secondary-200 transition hover:bg-white/10 hover:text-white" href="/admin/reports">
              Signalements
            </Link>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </SiteShell>
  );
}
