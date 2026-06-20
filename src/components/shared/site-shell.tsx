import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";

type SiteShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export async function SiteShell({
  children,
  title,
  description,
}: SiteShellProps) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link className="text-lg font-semibold tracking-tight" href="/">
              SquadFinder
            </Link>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
              Accueil
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="/annonces"
            >
              Annonces
            </Link>
            {session?.user ? (
              <>
                <Link
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href="/profile"
                >
                  Profile
                </Link>
                {session.user.role === "ADMIN" ? (
                  <Link
                    className="text-sm text-muted-foreground hover:text-foreground"
                    href="/admin"
                  >
                    Admin
                  </Link>
                ) : null}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button size="sm" variant="outline" type="submit">
                    Se deconnecter
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href="/login"
                >
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm">Creer un compte</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Starter kit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
