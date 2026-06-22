"use client";

import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { LevelBadge } from "@/components/shared/level-badge";
import { SportBadge } from "@/components/shared/sport-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Announcement } from "@/types";

function formatType(type: Announcement["type"]) {
  return type === "TEAM_LOOKING_PLAYER" ? "Équipe cherche joueur" : "Joueur cherche équipe";
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const isOpen = announcement.status === "OPEN";

  return (
    <Card className={`animate-sport-in group relative border-l-4 ${isOpen ? "border-l-success" : "border-l-secondary-300"} hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lift`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2"><SportBadge sport={announcement.game} /><span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-600">{formatType(announcement.type)}</span></div>
          <FavoriteButton postId={announcement.id} />
        </div>
        <CardTitle className="line-clamp-2 text-xl transition-colors group-hover:text-primary">{announcement.title}</CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-secondary-500">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" />{announcement.city}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-primary" />{new Date(announcement.matchDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{announcement.description}</p>
        <div className="flex flex-wrap items-center gap-2"><LevelBadge level={announcement.level} /><span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1 text-xs font-bold text-secondary-600 ring-1 ring-inset ring-secondary-200"><UsersRound className="size-3.5" />{announcement.slotsOpen} place{announcement.slotsOpen > 1 ? "s" : ""}</span></div>
      </CardContent>
      <CardFooter className="justify-between gap-3 bg-secondary-50/70">
        <div><p className="text-xs text-muted-foreground">Organisé par</p><p className="text-sm font-bold text-secondary-800">{announcement.author.name}</p></div>
        <Link href={`/annonces/${announcement.id}`}><Button size="sm" variant="premium">Voir l’annonce</Button></Link>
      </CardFooter>
    </Card>
  );
}
