import { Bell, ChevronDown, Dumbbell } from "lucide-react";
import Link from "next/link";

import { MobileNavigation } from "@/components/shared/mobile-navigation";
import AvatarRing from "@/components/shared/avatar-ring";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();
  const authenticated = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 border-b border-secondary-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link className="flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight text-secondary-900" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary/25"><Dumbbell className="size-5" /></span>
            Team<span className="-ml-2.5 text-primary">Match</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-secondary-600 md:flex">
            <Link className="transition hover:text-primary" href="/annonces">Annonces</Link>
            {authenticated ? <Link className="transition hover:text-primary" href="/dashboard">Dashboard</Link> : null}
            {authenticated ? <Link className="transition hover:text-primary" href="/creer-annonce">Créer une annonce</Link> : null}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <button type="button" className="relative rounded-full p-2.5 text-secondary-500 transition hover:bg-primary-50 hover:text-primary" aria-label="Notifications">
                <Bell className="size-5" /><span className="notification-pulse absolute right-2 top-2 size-2 rounded-full bg-danger" />
              </button>
              <DropdownMenu>
                <DropdownMenuContent align="end">
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-secondary-50">
                    <AvatarRing src={session.user.image ?? undefined} alt={session.user.name ?? "Utilisateur"} size="md" online={true} />
                    <ChevronDown className="size-4 text-secondary-400" />
                  </DropdownMenuTrigger>
                  <div className="min-w-48 space-y-1 p-2">
                    <Link href="/dashboard"><DropdownMenuItem>Dashboard</DropdownMenuItem></Link>
                    <Link href="/profile"><DropdownMenuItem>Profil</DropdownMenuItem></Link>
                    {session.user.role === "ADMIN" ? <Link href="/admin"><DropdownMenuItem>Administration</DropdownMenuItem></Link> : null}
                    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button type="submit" className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-danger-600 hover:bg-danger-50">Déconnexion</button></form>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <><Link className="text-sm font-semibold text-secondary-600 hover:text-primary" href="/login">Connexion</Link><Link href="/register"><Button size="sm" variant="premium">Inscription</Button></Link></>
          )}
        </div>
        <div className="md:hidden"><MobileNavigation authenticated={authenticated} admin={session?.user?.role === "ADMIN"} /></div>
      </div>
    </header>
  );
}
