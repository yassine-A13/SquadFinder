import { notFound } from "next/navigation";

import { applyToPost } from "@/server/actions/applications";
import { getPostById } from "@/server/actions/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AnnouncementDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const hasApplied = session?.user?.id
    ? Boolean(
        await prisma.application.findUnique({
          where: {
            postId_userId: {
              postId: post.id,
              userId: session.user.id,
            },
          },
          select: { id: true },
        }),
      )
    : false;

  const canApply =
    Boolean(session?.user?.id) &&
    session?.user?.id !== post.author.id &&
    !hasApplied &&
    post.status === "OPEN" &&
    post.type === "TEAM_LOOKING_PLAYER";

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{post.game}</Badge>
            <Badge variant="outline">{post.type === "TEAM_LOOKING_PLAYER" ? "Equipe cherche joueur" : "Joueur cherche equipe"}</Badge>
            <Badge variant={post.status === "OPEN" ? "default" : "outline"}>{post.status}</Badge>
          </div>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            {post.city} • {new Date(post.matchDate).toLocaleDateString("fr-FR")} a {post.matchTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{post.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <p>Niveau requis: {post.level}</p>
            <p>Joueurs recherches: {post.slotsOpen}</p>
            <p>Candidatures recues: {post.applicationsCount}</p>
            <p>Type: {post.type === "TEAM_LOOKING_PLAYER" ? "Equipe cherche joueur" : "Joueur cherche equipe"}</p>
          </div>

          {canApply ? (
            <form
              action={async () => {
                "use server";
                await applyToPost(post.id);
              }}
            >
              <Button type="submit">Postuler</Button>
            </form>
          ) : session?.user?.id === post.author.id ? (
            <p>Vous etes l&apos;auteur de cette annonce.</p>
          ) : hasApplied ? (
            <p>Vous avez deja postule a cette annonce.</p>
          ) : !session?.user ? (
            <p>Connectez-vous pour postuler.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auteur</CardTitle>
          <CardDescription>Resume du profil lie a cette annonce.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage alt={post.author.name} src={post.author.image ?? undefined} />
              <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">{post.author.city ?? "Ville non renseignee"}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Email: {post.author.email}</p>
            <p>Bio: {post.author.bio ?? "Aucune bio renseignee."}</p>
            <p>Disponibilite: {post.author.availability ?? "Non renseignee."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
