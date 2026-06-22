import { notFound } from "next/navigation";

import { applyToPost } from "@/server/actions/applications";
import { getPostById } from "@/server/actions/posts";
import { getReviewTargetsForPost } from "@/server/actions/reviews";
import AvatarRing from "@/components/shared/avatar-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { LevelBadge } from "@/components/shared/level-badge";
import { SportBadge } from "@/components/shared/sport-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReviewDialog } from "@/components/shared/ReviewDialog";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AnnouncementDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const post = await getPostById(id);
  const reviewTargets = await getReviewTargetsForPost(id);

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
      <Card className="border-t-4 border-t-primary shadow-lift">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <SportBadge sport={post.game} />
            <Badge variant="outline">{post.type === "TEAM_LOOKING_PLAYER" ? "Equipe cherche joueur" : "Joueur cherche equipe"}</Badge>
            <StatusBadge status={post.status} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                {post.city} • {new Date(post.matchDate).toLocaleDateString("fr-FR")} a {post.matchTime}
              </CardDescription>
            </div>
            <FavoriteButton postId={post.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{post.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">Niveau requis: <LevelBadge level={post.level} /></div>
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
              <Button type="submit" variant="premium">Postuler</Button>
            </form>
          ) : session?.user?.id === post.author.id ? (
            <p>Vous etes l&apos;auteur de cette annonce.</p>
          ) : hasApplied ? (
            <p>Vous avez deja postule a cette annonce.</p>
          ) : !session?.user ? (
            <p>Connectez-vous pour postuler.</p>
          ) : null}

          {reviewTargets.length > 0 ? (
            <div className="rounded-3xl border border-border/80 bg-background/70 p-4">
              <h3 className="text-lg font-semibold">Matchs à évaluer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Terminé. Partagez votre avis pour les joueurs impliqués.
              </p>
              <div className="space-y-3">
                {reviewTargets.map((target) => (
                  <div key={target.reviewedUserId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4">
                    <div>
                      <p className="font-medium">{target.reviewedUserName}</p>
                      <p className="text-sm text-muted-foreground">
                        {target.reviewRole === "AUTHOR" ? "Noter l'auteur" : "Noter le joueur"}
                      </p>
                    </div>
                    <ReviewDialog
                      postId={post.id}
                      reviewedUserId={target.reviewedUserId}
                      reviewedUserName={target.reviewedUserName}
                    />
                  </div>
                ))}
              </div>
            </div>
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
            <AvatarRing src={post.author.image ?? undefined} alt={post.author.name} size="lg" />
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
