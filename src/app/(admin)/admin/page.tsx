import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Moderation</CardTitle>
          <CardDescription>Validez ou refusez les annonces publiees.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Branchez ici vos actions Prisma pour gerer les contenus.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Suivi des roles et acces plateforme.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Le schema Prisma inclut deja un enum `Role` avec `PLAYER` et `ADMIN`.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Signalements</CardTitle>
          <CardDescription>Zone reservee a la revue des incidents.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ajoutez vos workflows de moderation dans `src/server/actions/posts.ts`.
        </CardContent>
      </Card>
    </div>
  );
}
