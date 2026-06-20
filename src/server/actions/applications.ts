"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const postIdSchema = z.string().min(1);
const respondSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type ApplicationListItem = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  post: {
    id: string;
    title: string;
    city: string;
    matchDate: string;
    matchTime: string;
    type: "TEAM_LOOKING_PLAYER" | "PLAYER_LOOKING_TEAM";
  };
  candidate: {
    id: string;
    name: string;
    image: string | null;
    city: string | null;
  };
};

type ActionResponse = {
  ok: boolean;
  message: string;
};

async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function revalidateApplicationsPaths(postId?: string) {
  const paths = ["/mes-candidatures", "/invitations", "/mes-annonces", "/dashboard"];
  if (postId) {
    paths.push(`/annonces/${postId}`);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function applyToPost(postId: string): Promise<ActionResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour postuler.",
    };
  }

  const parsedPostId = postIdSchema.safeParse(postId);

  if (!parsedPostId.success) {
    return {
      ok: false,
      message: "Annonce invalide.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: parsedPostId.data },
    select: {
      id: true,
      title: true,
      authorId: true,
      status: true,
    },
  });

  if (!post || post.status !== "OPEN") {
    return {
      ok: false,
      message: "Cette annonce n'est plus disponible.",
    };
  }

  if (post.authorId === userId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas postuler a votre propre annonce.",
    };
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      postId_userId: {
        postId: post.id,
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingApplication) {
    return {
      ok: false,
      message: "Vous avez deja postule a cette annonce.",
    };
  }

  await prisma.$transaction([
    prisma.application.create({
      data: {
        postId: post.id,
        userId,
        status: "PENDING",
      },
    }),
    prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "Nouvelle candidature",
        content: `Une nouvelle candidature a ete envoyee pour votre annonce "${post.title}".`,
        type: "APPLICATION",
      },
    }),
  ]);

  revalidateApplicationsPaths(post.id);

  return {
    ok: true,
    message: "Candidature envoyee avec succes.",
  };
}

export async function getMyApplications(): Promise<ApplicationListItem[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
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
        },
      },
      user: {
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
    },
  });

  return applications.map((application) => ({
    id: application.id,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
    post: {
      id: application.post.id,
      title: application.post.title,
      city: application.post.city,
      matchDate: application.post.matchDate.toISOString(),
      matchTime: application.post.matchTime,
      type: application.post.type,
    },
    candidate: {
      id: application.user.id,
      name: application.user.name,
      image: application.user.image,
      city: application.user.profile?.city ?? null,
    },
  }));
}

export async function getReceivedApplications(postId?: string): Promise<ApplicationListItem[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const parsedPostId = postId ? postIdSchema.safeParse(postId) : null;

  const applications = await prisma.application.findMany({
    where: {
      post: {
        authorId: userId,
        ...(parsedPostId?.success ? { id: parsedPostId.data } : {}),
      },
    },
    orderBy: [{ post: { createdAt: "desc" } }, { createdAt: "desc" }],
    include: {
      post: {
        select: {
          id: true,
          title: true,
          city: true,
          matchDate: true,
          matchTime: true,
          type: true,
        },
      },
      user: {
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
    },
  });

  return applications.map((application) => ({
    id: application.id,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
    post: {
      id: application.post.id,
      title: application.post.title,
      city: application.post.city,
      matchDate: application.post.matchDate.toISOString(),
      matchTime: application.post.matchTime,
      type: application.post.type,
    },
    candidate: {
      id: application.user.id,
      name: application.user.name,
      image: application.user.image,
      city: application.user.profile?.city ?? null,
    },
  }));
}

async function findDirectConversation(userA: string, userB: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId: userA,
        },
      },
      AND: {
        members: {
          some: {
            userId: userB,
          },
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  return (
    conversations.find((conversation) => {
      const memberIds = conversation.members.map((member) => member.userId);
      return memberIds.length === 2 && memberIds.includes(userA) && memberIds.includes(userB);
    }) ?? null
  );
}

export async function respondToApplication(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<ActionResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour gerer une candidature.",
    };
  }

  const parsed = respondSchema.safeParse({ applicationId, status });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Demande invalide.",
    };
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          authorId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!application || application.post.authorId !== userId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas repondre a cette candidature.",
    };
  }

  await prisma.application.update({
    where: { id: application.id },
    data: {
      status: parsed.data.status,
    },
  });

  if (parsed.data.status === "ACCEPTED") {
    const existingConversation = await findDirectConversation(application.post.authorId, application.user.id);

    if (!existingConversation) {
      await prisma.conversation.create({
        data: {
          members: {
            create: [
              { userId: application.post.authorId },
              { userId: application.user.id },
            ],
          },
        },
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: application.user.id,
      title:
        parsed.data.status === "ACCEPTED"
          ? "Candidature acceptee"
          : "Candidature refusee",
      content:
        parsed.data.status === "ACCEPTED"
          ? `Votre candidature pour "${application.post.title}" a ete acceptee.`
          : `Votre candidature pour "${application.post.title}" a ete refusee.`,
      type: "APPLICATION",
    },
  });

  revalidateApplicationsPaths(application.post.id);

  return {
    ok: true,
    message:
      parsed.data.status === "ACCEPTED"
        ? "Candidature acceptee."
        : "Candidature refusee.",
  };
}
