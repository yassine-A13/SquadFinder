import { notFound } from "next/navigation";

import AvatarRing from "@/components/shared/avatar-ring";
// badge intentionally unused here; styles handled by SportBadge/LevelBadge
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/server/actions/profile";
import { getAverageRating, getUserReviews } from "@/server/actions/reviews";
import { auth } from "@/lib/auth";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { StarRating } from "@/components/shared/StarRating";
// UserSportLevel type not required for styling changes
import { LevelBadge } from "@/components/shared/level-badge";
import { SportBadge } from "@/components/shared/sport-badge";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const user = await getProfile(id);
  const reviews = await getUserReviews(id);
  const ratingSummary = await getAverageRating(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card className="border-t-4 border-t-primary shadow-lift">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          <AvatarRing src={user.image ?? undefined} alt={user.name} size="xl" level={user.sports?.[0]?.level ?? null} />

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.profile?.city ?? "Ville non renseignee"}
              {user.profile?.age ? ` • ${user.profile.age} ans` : ""}
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {user.profile?.bio ?? "Ce joueur n'a pas encore complete sa bio."}
            </p>
            {session?.user?.id && session.user.id !== user.id ? (
              <div className="pt-4">
                <ReportDialog reportedUserId={user.id} />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Sports pratiques</CardTitle>
          <CardDescription>Les niveaux sont affiches pour chaque sport.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {user.sports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun sport renseigne.</p>
          ) : (
            user.sports.map((userSport) => (
              <div className="flex flex-wrap items-center gap-2" key={userSport.id}>
                <SportBadge sport={userSport.sport.name} />
                <LevelBadge level={userSport.level} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Reputation</CardTitle>
              <CardDescription>Notes moyennes et retours de la communaute.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(ratingSummary.averageRating * 10) / 10} readOnly />
              <span className="text-sm text-muted-foreground">{ratingSummary.reviewCount} avis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-3xl border border-border/80 bg-background/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{review.reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <StarRating rating={review.rating} readOnly />
                  </div>
                  {review.comment ? <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed border-border/80 bg-background/70 shadow-sm">
        <CardHeader>
          <CardTitle>Reviews a venir</CardTitle>
          <CardDescription>
            La section des avis sera branchee en Phase 9.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
