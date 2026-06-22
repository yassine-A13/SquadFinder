"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult, Announcement } from "@/types";

const postIdSchema = z.string().min(1, "Identifiant de l'annonce requis.");

async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function mapPost(post: {
  id: string;
  title: string;
  description: string;
  city: string;
  matchDate: Date;
  matchTime: string;
  requiredLevel: string;
  playersNeeded: number;
  type: "TEAM_LOOKING_PLAYER" | "PLAYER_LOOKING_TEAM";
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  _count: { applications: number };
  sport: { name: string };
  author: {
    id: string;
    name: string;
    image: string | null;
    profile?: { city: string | null } | null;
  };
}): Announcement {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    city: post.city,
    matchDate: post.matchDate.toISOString(),
    matchTime: post.matchTime,
    level: post.requiredLevel,
    game: post.sport.name,
    slotsOpen: post.playersNeeded,
    type: post.type,
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    applicationsCount: post._count.applications,
    author: {
      id: post.author.id,
      name: post.author.name,
      image: post.author.image,
      city: post.author.profile?.city ?? null,
    },
  };
}

export async function toggleFavorite(postId: string): Promise<ActionResult<{ favorited: boolean }>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ok: false, message: "Vous devez etre connecte pour gerer vos favoris." };
  }

  const parsed = postIdSchema.safeParse(postId);

  if (!parsed.success) {
    return { ok: false, message: "Annonce invalide." };
  }

  const post = await prisma.post.findUnique({
    where: { id: parsed.data },
    select: { id: true },
  });

  if (!post) {
    return { ok: false, message: "Annonce introuvable." };
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: post.id,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });

    return {
      ok: true,
      message: "Annonce retiree de vos favoris.",
      data: { favorited: false },
    };
  }

  await prisma.favorite.create({
    data: {
      userId,
      postId: post.id,
    },
  });

  return {
    ok: true,
    message: "Annonce ajoutee a vos favoris.",
    data: { favorited: true },
  };
}

export async function getMyFavoritePostIds(): Promise<string[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { postId: true },
  });

  return favorites.map((favorite) => favorite.postId);
}

export async function getMyFavorites(): Promise<Announcement[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          sport: {
            select: { name: true },
          },
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: { select: { city: true } },
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      },
    },
  });

  return favorites.map((favorite) => mapPost(favorite.post));
}
