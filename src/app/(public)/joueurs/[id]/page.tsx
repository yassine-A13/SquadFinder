import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/server/actions/profile";
import type { UserSportLevel } from "@/lib/validators";

type PageProps = {
  params: Promise<{ id: string }>;
};

const levelLabels: Record<UserSportLevel, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

const levelBadgeClasses: Record<UserSportLevel, string> = {
  BEGINNER: "bg-slate-100 text-slate-700 border-slate-200",
  INTERMEDIATE: "bg-blue-100 text-blue-700 border-blue-200",
  ADVANCED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXPERT: "bg-amber-100 text-amber-700 border-amber-200",
};

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getProfile(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          <Avatar className="h-28 w-28">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.profile?.city ?? "Ville non renseignee"}
              {user.profile?.age ? ` • ${user.profile.age} ans` : ""}
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {user.profile?.bio ?? "Ce joueur n'a pas encore complete sa bio."}
            </p>
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
              <Badge
                key={userSport.id}
                className={levelBadgeClasses[userSport.level]}
                variant="outline"
              >
                {userSport.sport.name} - {levelLabels[userSport.level]}
              </Badge>
            ))
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
