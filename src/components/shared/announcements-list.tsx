"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Announcement } from "@/types";

async function getAnnouncements() {
  const response = await fetch("/api/annonces");

  if (!response.ok) {
    throw new Error("Impossible de charger les annonces.");
  }

  return (await response.json()) as Announcement[];
}

export function AnnouncementsList() {
  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  if (query.isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des annonces...</p>;
  }

  if (query.isError) {
    return <p className="text-sm text-destructive">Erreur lors du chargement des annonces.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {query.data?.map((announcement) => (
        <Card key={announcement.id} className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>{announcement.title}</CardTitle>
            <CardDescription>
              {announcement.game} • {announcement.level}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Lieu: {announcement.location}</p>
            <p>Places ouvertes: {announcement.slotsOpen}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
