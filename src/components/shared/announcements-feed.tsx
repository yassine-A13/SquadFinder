"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AnnouncementCard } from "@/components/shared/announcement-card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Announcement, PostSortOption } from "@/types";

type AnnouncementsFeedProps = {
  sports: Array<{ id: string; name: string }>;
  cities: string[];
};

type FiltersState = {
  sport: string;
  city: string;
  level: string;
  date: string;
  type: string;
  sort: PostSortOption;
};

const defaultFilters: FiltersState = {
  sport: "all",
  city: "all",
  level: "all",
  date: "",
  type: "all",
  sort: "recent",
};

const levelOptions = [
  { value: "BEGINNER", label: "Debutant" },
  { value: "INTERMEDIATE", label: "Intermediaire" },
  { value: "ADVANCED", label: "Avance" },
  { value: "EXPERT", label: "Expert" },
];

const typeOptions = [
  { value: "TEAM_LOOKING_PLAYER", label: "Equipe cherche joueur" },
  { value: "PLAYER_LOOKING_TEAM", label: "Joueur cherche equipe" },
];

async function fetchAnnouncements(filters: FiltersState) {
  const params = new URLSearchParams();

  if (filters.sport !== "all") params.set("sport", filters.sport);
  if (filters.city !== "all") params.set("city", filters.city);
  if (filters.level !== "all") params.set("level", filters.level);
  if (filters.date) params.set("date", filters.date);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.sort) params.set("sort", filters.sort);

  const response = await fetch(`/api/annonces?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Impossible de charger les annonces.");
  }

  return (await response.json()) as Announcement[];
}

export function AnnouncementsFeed({ sports, cities }: AnnouncementsFeedProps) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const query = useQuery({
    queryKey: ["announcements", filters],
    queryFn: () => fetchAnnouncements(filters),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 md:grid-cols-3 xl:grid-cols-6">
        <Select
          onValueChange={(value) => setFilters((current) => ({ ...current, sport: value }))}
          value={filters.sport}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sports</SelectItem>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilters((current) => ({ ...current, city: value }))}
          value={filters.city}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilters((current) => ({ ...current, level: value }))}
          value={filters.level}
        >
          <SelectTrigger>
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {levelOptions.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}
          value={filters.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {typeOptions.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePicker
          onChange={(value) => setFilters((current) => ({ ...current, date: value }))}
          value={filters.date}
        />

        <Select
          onValueChange={(value) =>
            setFilters((current) => ({ ...current, sort: value as PostSortOption }))
          }
          value={filters.sort}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus recent</SelectItem>
            <SelectItem value="matchDate">Date du match</SelectItem>
            <SelectItem value="popular">Popularite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : null}
      {query.isError ? (
        <p className="text-sm text-destructive">Erreur lors du chargement des annonces.</p>
      ) : null}
      {!query.isLoading && !query.isError && !query.data?.length ? (
        <p className="text-sm text-muted-foreground">
          Aucune annonce ne correspond aux filtres selectionnes.
        </p>
      ) : null}
      {query.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
