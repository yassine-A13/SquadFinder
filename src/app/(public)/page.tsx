import Link from "next/link";

import { AnnouncementsList } from "@/components/shared/announcements-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/70 p-8 shadow-sm lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <p className="max-w-xl text-lg text-muted-foreground">
            Base projet Next.js 15 prete pour construire une plateforme de recrutement de
            joueurs, annonces et messagerie temps reel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Commencer</Button>
            </Link>
            <Link href="/annonces">
              <Button size="lg" variant="outline">
                Voir les annonces
              </Button>
            </Link>
          </div>
        </div>
        <Card className="border-border/80 bg-background/85">
          <CardHeader>
            <CardTitle>Stack deja branchee</CardTitle>
            <CardDescription>Les briques demandees sont presentes dans le projet.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <p>Next.js 15</p>
            <p>App Router</p>
            <p>Prisma</p>
            <p>PostgreSQL</p>
            <p>Auth.js</p>
            <p>TanStack Query</p>
            <p>Shadcn UI</p>
            <p>Zod + RHF</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Apercu des annonces</h2>
          <p className="text-sm text-muted-foreground">
            Cette liste consomme deja une route App Router via TanStack Query.
          </p>
        </div>
        <AnnouncementsList />
      </section>
    </div>
  );
}
