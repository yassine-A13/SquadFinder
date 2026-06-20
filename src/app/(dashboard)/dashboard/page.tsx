import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Donnees lues depuis la session Auth.js.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Nom: {session?.user?.name ?? "A renseigner"}</p>
          <p>E-mail: {session?.user?.email ?? "A renseigner"}</p>
          <p>Role: {session?.user?.role ?? "PLAYER"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Zone prete pour vos candidatures aux squads.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connectez cette carte aux Server Actions de `src/server/actions/applications.ts`.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Pusher pourra alimenter le temps reel ici.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Les variables Pusher sont deja documentees dans `.env.example`.
        </CardContent>
      </Card>
    </div>
  );
}
