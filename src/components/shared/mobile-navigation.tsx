"use client";

import { LayoutDashboard, LogIn, Menu, PlusCircle, Search, Settings, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function MobileNavigation({ authenticated, admin }: { authenticated: boolean; admin: boolean }) {
  const links = authenticated
    ? [
        { href: "/annonces", label: "Explorer les annonces", icon: Search },
        { href: "/creer-annonce", label: "Créer une annonce", icon: PlusCircle },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/profile", label: "Mon profil", icon: UserRound },
        { href: "/settings", label: "Paramètres", icon: Settings },
        ...(admin ? [{ href: "/admin", label: "Administration", icon: ShieldCheck }] : []),
      ]
    : [
        { href: "/annonces", label: "Explorer les annonces", icon: Search },
        { href: "/login", label: "Connexion", icon: LogIn },
      ];

  return (
    <Sheet trigger={<Button variant="ghost" size="icon" aria-label="Ouvrir la navigation"><Menu className="size-5" /></Button>}>
      <nav className="grid gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-secondary-200 transition hover:bg-white/10 hover:text-white">
            <Icon className="size-5 text-primary-400" />{label}
          </Link>
        ))}
        {!authenticated ? <Link href="/register" className="mt-5"><Button variant="premium" className="w-full">Rejoindre TeamMatch</Button></Link> : null}
      </nav>
    </Sheet>
  );
}
