import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Announcement } from "@/types";

function formatType(type: Announcement["type"]) {
  return type === "TEAM_LOOKING_PLAYER" ? "Equipe cherche joueur" : "Joueur cherche equipe";
}

function formatLevel(level: string) {
  switch (level) {
    case "BEGINNER":
      return "Debutant";
    case "INTERMEDIATE":
      return "Intermediaire";
    case "ADVANCED":
      return "Avance";
    case "EXPERT":
      return "Expert";
    default:
      return level;
  }
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{announcement.game}</Badge>
          <Badge variant="outline">{formatType(announcement.type)}</Badge>
        </div>
        <CardTitle>{announcement.title}</CardTitle>
        <CardDescription>
          {announcement.city} • {new Date(announcement.matchDate).toLocaleDateString("fr-FR")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{announcement.description}</p>
        <div className="flex flex-wrap gap-4">
          <span>Niveau: {formatLevel(announcement.level)}</span>
          <span>Joueurs recherches: {announcement.slotsOpen}</span>
          <span>Candidatures: {announcement.applicationsCount}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Par {announcement.author.name}</span>
        <Link href={`/annonces/${announcement.id}`}>
          <Button size="sm">Voir detail</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
