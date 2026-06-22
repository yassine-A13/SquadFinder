import Link from "next/link";

import { getMyPosts } from "@/server/actions/posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
 
export default async function DashboardPage() {
  const session = await auth();
  const myPosts = await getMyPosts();

  return (
    <div className="space-y-6">
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
          <div className="pt-3">
            <Link href="/profile">
              <Button size="sm" variant="outline">Gerer mon profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mes annonces</CardTitle>
            <CardDescription>
              Nombre d&apos;annonces publiees depuis votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{myPosts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annonces ouvertes</CardTitle>
            <CardDescription>Vos annonces actuellement visibles publiquement.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {myPosts.filter((post) => post.status === "OPEN").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des annonces</CardTitle>
          <CardDescription>
            Creez, modifiez et suivez vos annonces depuis les pages dediees.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/creer-annonce">
            <Button>Creer une annonce</Button>
          </Link>
          <Link href="/mes-annonces">
            <Button variant="outline">Voir mes annonces</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des candidatures</CardTitle>
          <CardDescription>
            Suivez vos candidatures envoyees et repondez a celles recues sur vos annonces.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/mes-candidatures">
            <Button variant="outline">Mes candidatures</Button>
          </Link>
          <Link href="/invitations">
            <Button variant="outline">Candidatures recues</Button>
          </Link>
          <Link href="/favoris">
            <Button variant="secondary">Mes favoris</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
