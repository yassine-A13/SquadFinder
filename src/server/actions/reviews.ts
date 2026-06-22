"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

const reviewSchema = z.object({
  reviewedUserId: z.string().min(1, "Identifiant de l'utilisateur requis."),
  postId: z.string().min(1, "Identifiant de l'annonce requis."),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
});

async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createReview(
  reviewedUserId: string,
  postId: string,
  rating: number,
  comment?: string,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ok: false, message: "Vous devez etre connecte pour noter un match." };
  }

  const parsed = reviewSchema.safeParse({ reviewedUserId, postId, rating, comment });

  if (!parsed.success) {
    return { ok: false, message: "Les donnees de l'avis sont invalides." };
  }

  if (parsed.data.reviewedUserId === userId) {
    return { ok: false, message: "Vous ne pouvez pas vous noter vous-meme." };
  }

  const post = await prisma.post.findUnique({
    where: { id: parsed.data.postId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      applications: {
        where: { status: "ACCEPTED" },
        select: { userId: true },
      },
    },
  });

  if (!post) {
    return { ok: false, message: "Annonce introuvable." };
  }

  if (post.matchDate > new Date()) {
    return { ok: false, message: "Le match n'est pas encore termine." };
  }

  const isAuthor = post.author.id === userId;
  const isReviewedUserAuthor = post.author.id === parsed.data.reviewedUserId;
  const acceptedParticipant = post.applications.some((application) => application.userId === userId);
  const reviewedParticipant = post.applications.some(
    (application) => application.userId === parsed.data.reviewedUserId,
  );

  const canReview =
    (isAuthor && reviewedParticipant) ||
    (!isAuthor && isReviewedUserAuthor && acceptedParticipant);

  if (!canReview) {
    return {
      ok: false,
      message:
        "Vous ne pouvez pas noter ce joueur. Assurez-vous d'avoir participe au meme match et que la date est passee.",
    };
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      reviewedUserId: parsed.data.reviewedUserId,
    },
  });

  if (existingReview) {
    return {
      ok: false,
      message: "Vous avez deja laisse un avis pour cet utilisateur.",
    };
  }

  await prisma.review.create({
    data: {
      reviewerId: userId,
      reviewedUserId: parsed.data.reviewedUserId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: parsed.data.reviewedUserId,
      title: "Nouveau commentaire",
      content: `Vous avez recu une note de ${parsed.data.rating} etoiles sur SquadFinder.`,
      type: "REVIEW",
    },
  });

  return { ok: true, message: "Avis enregistre avec succes." };
}

export async function getUserReviews(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { reviewedUserId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    reviewer: {
      id: review.reviewer.id,
      name: review.reviewer.name,
      image: review.reviewer.image,
    },
  }));
}

export async function getAverageRating(userId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { reviewedUserId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: aggregate._avg.rating ?? 0,
    reviewCount: aggregate._count.rating,
  };
}

export async function getPendingReviews() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const now = new Date();
  const reviewableMatches: Array<{
    postId: string;
    title: string;
    city: string;
    matchDate: string;
    matchTime: string;
    reviewedUser: { id: string; name: string; image: string | null };
    reviewedUserRole: "AUTHOR" | "CANDIDATE";
  }> = [];

  const acceptedApplications = await prisma.application.findMany({
    where: {
      userId,
      status: "ACCEPTED",
      post: {
        matchDate: { lt: now },
      },
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          city: true,
          matchDate: true,
          matchTime: true,
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  for (const application of acceptedApplications) {
    const reviewedUserId = application.post.author.id;

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: userId,
        reviewedUserId,
      },
    });

    if (!existingReview && reviewedUserId !== userId) {
      reviewableMatches.push({
        postId: application.post.id,
        title: application.post.title,
        city: application.post.city,
        matchDate: application.post.matchDate.toISOString(),
        matchTime: application.post.matchTime,
        reviewedUser: {
          id: application.post.author.id,
          name: application.post.author.name,
          image: application.post.author.image,
        },
        reviewedUserRole: "AUTHOR",
      });
    }
  }

  const acceptedCandidateApplications = await prisma.application.findMany({
    where: {
      status: "ACCEPTED",
      post: {
        authorId: userId,
        matchDate: { lt: now },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          city: true,
          matchDate: true,
          matchTime: true,
        },
      },
    },
  });

  for (const application of acceptedCandidateApplications) {
    const reviewedUserId = application.user.id;

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: userId,
        reviewedUserId,
      },
    });

    if (!existingReview && reviewedUserId !== userId) {
      reviewableMatches.push({
        postId: application.post.id,
        title: application.post.title,
        city: application.post.city,
        matchDate: application.post.matchDate.toISOString(),
        matchTime: application.post.matchTime,
        reviewedUser: {
          id: application.user.id,
          name: application.user.name,
          image: application.user.image,
        },
        reviewedUserRole: "CANDIDATE",
      });
    }
  }

  return reviewableMatches;
}

export async function getReviewTargetsForPost(postId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      applications: {
        where: { status: "ACCEPTED" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!post || post.matchDate > new Date()) {
    return [];
  }

  const targets: Array<{
    reviewedUserId: string;
    reviewedUserName: string;
    reviewedUserImage: string | null;
    reviewRole: "AUTHOR" | "CANDIDATE";
  }> = [];

  const hasReviewedAuthor = await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      reviewedUserId: post.author.id,
    },
  });

  if (
    post.author.id !== userId &&
    post.applications.some((application) => application.user.id === userId) &&
    !hasReviewedAuthor
  ) {
    targets.push({
      reviewedUserId: post.author.id,
      reviewedUserName: post.author.name,
      reviewedUserImage: post.author.image,
      reviewRole: "AUTHOR",
    });
  }

  if (post.author.id === userId) {
    for (const application of post.applications) {
      if (application.user.id !== userId) {
        const hasReviewedCandidate = await prisma.review.findFirst({
          where: {
            reviewerId: userId,
            reviewedUserId: application.user.id,
          },
        });

        if (!hasReviewedCandidate) {
          targets.push({
            reviewedUserId: application.user.id,
            reviewedUserName: application.user.name,
            reviewedUserImage: application.user.image,
            reviewRole: "CANDIDATE",
          });
        }
      }
    }
  }

  return targets;
}
