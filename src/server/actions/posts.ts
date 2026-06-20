"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  postSchema,
  postsFiltersSchema,
  type PostFiltersInput,
  type PostInput,
} from "@/lib/validators";
import type { ActionResult, Announcement } from "@/types";

type PostListItem = Announcement;

type PostDetail = PostListItem & {
  author: PostListItem["author"] & {
    email: string;
    bio: string | null;
    availability: string | null;
  };
};

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
    email?: string;
    profile?: {
      city: string | null;
      bio?: string | null;
      availability?: string | null;
    } | null;
  };
}): PostListItem {
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

function getRevalidationPaths(postId?: string) {
  return [
    "/",
    "/annonces",
    "/dashboard",
    "/creer-annonce",
    "/mes-annonces",
    ...(postId ? [`/annonces/${postId}`] : []),
  ];
}

async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function normalizeFilters(filters?: PostFiltersInput) {
  const parsed = postsFiltersSchema.safeParse(filters ?? {});
  return parsed.success ? parsed.data : {};
}

export async function createPost(data: PostInput): Promise<ActionResult<{ id: string }>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour publier une annonce.",
    };
  }

  const parsed = postSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Les donnees de l'annonce sont invalides.",
    };
  }

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      sportId: parsed.data.sportId,
      matchDate: new Date(parsed.data.matchDate),
      matchTime: parsed.data.matchTime,
      requiredLevel: parsed.data.requiredLevel,
      playersNeeded: parsed.data.playersNeeded,
      type: parsed.data.type,
      status: "OPEN",
    },
    select: {
      id: true,
    },
  });

  for (const path of getRevalidationPaths(post.id)) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: "Annonce publiee avec succes.",
    data: { id: post.id },
  };
}

export async function getPosts(filters?: PostFiltersInput): Promise<PostListItem[]> {
  const parsedFilters = normalizeFilters(filters);
  const orderBy =
    parsedFilters.sort === "matchDate"
      ? [{ matchDate: "asc" as const }, { createdAt: "desc" as const }]
      : parsedFilters.sort === "popular"
        ? [{ applications: { _count: "desc" as const } }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const posts = await prisma.post.findMany({
    where: {
      status: "OPEN",
      ...(parsedFilters.sport ? { sportId: parsedFilters.sport } : {}),
      ...(parsedFilters.city ? { city: parsedFilters.city } : {}),
      ...(parsedFilters.level ? { requiredLevel: parsedFilters.level } : {}),
      ...(parsedFilters.date
        ? {
            matchDate: {
              gte: new Date(`${parsedFilters.date}T00:00:00.000Z`),
              lt: new Date(`${parsedFilters.date}T23:59:59.999Z`),
            },
          }
        : {}),
      ...(parsedFilters.type ? { type: parsedFilters.type } : {}),
    },
    orderBy,
    include: {
      sport: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              city: true,
            },
          },
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return posts.map(mapPost);
}

export async function getPostById(id: string): Promise<PostDetail> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      sport: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          profile: {
            select: {
              city: true,
              bio: true,
              availability: true,
            },
          },
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const mapped = mapPost(post);

  return {
    ...mapped,
    author: {
      ...mapped.author,
      email: post.author.email,
      bio: post.author.profile?.bio ?? null,
      availability: post.author.profile?.availability ?? null,
    },
  };
}

export async function getMyPosts(): Promise<PostListItem[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sport: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              city: true,
            },
          },
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return posts.map(mapPost);
}

export async function updatePost(
  id: string,
  data: PostInput,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour modifier une annonce.",
    };
  }

  const parsed = postSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Les donnees de l'annonce sont invalides.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      authorId: true,
    },
  });

  if (!post || post.authorId !== userId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas modifier cette annonce.",
    };
  }

  await prisma.post.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      sportId: parsed.data.sportId,
      matchDate: new Date(parsed.data.matchDate),
      matchTime: parsed.data.matchTime,
      requiredLevel: parsed.data.requiredLevel,
      playersNeeded: parsed.data.playersNeeded,
      type: parsed.data.type,
    },
  });

  for (const path of getRevalidationPaths(id)) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: "Annonce modifiee avec succes.",
    data: { id },
  };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour supprimer une annonce.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      authorId: true,
    },
  });

  if (!post || post.authorId !== userId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas supprimer cette annonce.",
    };
  }

  await prisma.post.delete({
    where: { id },
  });

  for (const path of getRevalidationPaths(id)) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: "Annonce supprimee avec succes.",
  };
}

export async function closePost(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour fermer une annonce.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      authorId: true,
    },
  });

  if (!post || post.authorId !== userId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas fermer cette annonce.",
    };
  }

  await prisma.post.update({
    where: { id },
    data: {
      status: "CLOSED",
    },
  });

  for (const path of getRevalidationPaths(id)) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: "Annonce fermee avec succes.",
  };
}
