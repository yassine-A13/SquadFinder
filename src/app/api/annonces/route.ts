import { NextResponse } from "next/server";

import type { Announcement } from "@/types";

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Recherche support pour tournoi Valorant",
    location: "Casablanca",
    level: "Intermediaire",
    game: "Valorant",
    slotsOpen: 2,
  },
  {
    id: "2",
    title: "Equipe FC 25 cherche milieu defensif",
    location: "Rabat",
    level: "Competitif",
    game: "EA Sports FC 25",
    slotsOpen: 1,
  },
  {
    id: "3",
    title: "Roster League of Legends en formation",
    location: "Remote",
    level: "Debutant",
    game: "League of Legends",
    slotsOpen: 3,
  },
];

export async function GET() {
  return NextResponse.json(announcements);
}
