"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function getDashboardStats() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      activePosts: 0,
      pendingApplications: 0,
      invitations: 0,
      unreadMessages: 0,
    };
  }

  const [activePosts, pendingApplications, invitations, unreadMessages] = await Promise.all([
    prisma.post.count({
      where: {
        authorId: userId,
        status: "OPEN",
      },
    }),
    prisma.application.count({
      where: {
        userId,
        status: "PENDING",
      },
    }),
    prisma.application.count({
      where: {
        post: {
          authorId: userId,
        },
        status: "PENDING",
      },
    }),
    prisma.message.count({
      where: {
        conversation: {
          members: {
            some: {
              userId,
            },
          },
        },
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    }),
  ]);

  return {
    activePosts,
    pendingApplications,
    invitations,
    unreadMessages,
  };
}

export async function getUpcomingMatches() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        {
          userId,
        },
        {
          post: {
            authorId: userId,
          },
        },
      ],
      post: {
        matchDate: {
          gt: new Date(),
        },
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
          type: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      post: {
        matchDate: "asc",
      },
    },
    take: 5,
  });

  const uniqueMatches = new Map<string, ReturnType<typeof mapMatch>>();

  function mapMatch(application: (typeof applications)[number]) {
    const isCandidate = application.userId === userId;
    return {
      id: application.post.id,
      title: application.post.title,
      city: application.post.city,
      matchDate: application.post.matchDate.toISOString(),
      matchTime: application.post.matchTime,
      type: application.post.type,
      role: isCandidate ? "Joueur" : "Organisateur",
      partnerName: isCandidate ? application.post.author.name : application.user.name,
    };
  }

  for (const application of applications) {
    if (!uniqueMatches.has(application.post.id)) {
      uniqueMatches.set(application.post.id, mapMatch(application));
    }
  }

  return Array.from(uniqueMatches.values());
}
