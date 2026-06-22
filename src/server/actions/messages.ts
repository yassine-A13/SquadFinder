"use server";

import { z } from "zod";

import type { ActionResult } from "@/types";
import { prisma } from "@/lib/prisma";
import { serverPusher } from "@/lib/pusher/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";

export type ConversationItem = {
  id: string;
  interlocutor: {
    id: string;
    name: string;
    image: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
};

export type MessageItem = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
  isRead: boolean;
  senderId: string;
};

const conversationIdSchema = z.string().min(1);
const messageContentSchema = z.string().trim().min(1).max(4000);

export async function getConversations(): Promise<ConversationItem[]> {
  const userId = (await getCurrentUser())?.id;

  if (!userId) {
    return [];
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
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
    _count: {
      _all: true,
    },
  });

  const unreadMap = new Map(unreadCounts.map((entry) => [entry.conversationId, entry._count._all]));

  return conversations
    .map((conversation) => {
      const interlocutorMember = conversation.members.find((member) => member.userId !== userId);
      const interlocutor = interlocutorMember?.user ?? conversation.members[0].user;
      const lastMessage = conversation.messages[0]
        ? {
            id: conversation.messages[0].id,
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt.toISOString(),
            senderId: conversation.messages[0].senderId,
            isRead: conversation.messages[0].isRead,
          }
        : null;

      return {
        id: conversation.id,
        interlocutor: {
          id: interlocutor.id,
          name: interlocutor.name,
          image: interlocutor.image,
        },
        lastMessage,
        unreadCount: unreadMap.get(conversation.id) ?? 0,
        updatedAt: lastMessage?.createdAt ?? conversation.createdAt.toISOString(),
      };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 30,
): Promise<{ messages: MessageItem[]; hasMore: boolean }> {
  const userId = (await getCurrentUser())?.id;

  if (!userId) {
    return { messages: [], hasMore: false };
  }

  const membership = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!membership) {
    return { messages: [], hasMore: false };
  }

  const total = await prisma.message.count({
    where: {
      conversationId,
    },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    messages: messages
      .map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          image: message.sender.image,
        },
        isRead: message.isRead,
        senderId: message.senderId,
      }))
      .reverse(),
    hasMore: total > page * limit,
  };
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ActionResult<null>> {
  const parsedConversationId = conversationIdSchema.safeParse(conversationId);
  const parsedContent = messageContentSchema.safeParse(content);
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour envoyer un message.",
    };
  }

  if (!parsedConversationId.success || !parsedContent.success) {
    return { ok: false, message: "Le message est invalide." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: parsedConversationId.data,
    },
    include: {
      members: true,
    },
  });

  if (!conversation || !conversation.members.some((member) => member.userId === userId)) {
    return {
      ok: false,
      message: "Conversation introuvable ou acces refuse.",
    };
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content: parsedContent.data,
    },
  });

  const recipients = conversation.members
    .filter((member) => member.userId !== userId)
    .map((member) => member.userId);

  for (const recipientId of recipients) {
    await createNotification(
      recipientId,
      "Nouveau message",
      "Vous avez recu un nouveau message sur TeamMatch.",
      "MESSAGE",
    );
  }

  await serverPusher.trigger(`private-conversation-${conversation.id}`, "new-message", {
    message: {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: userId,
        name: currentUser.name ?? "Utilisateur",
        image: currentUser.image ?? null,
      },
    },
  });

  return {
    ok: true,
    message: "Message envoye.",
  };
}

export async function markAsRead(
  conversationId: string,
): Promise<ActionResult<{ count: number }>> {
  const userId = (await getCurrentUser())?.id;

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour marquer les messages comme lus.",
    };
  }

  const membership = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!membership) {
    return {
      ok: false,
      message: "Conversation introuvable ou acces refuse.",
    };
  }

  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: {
        not: userId,
      },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  await serverPusher.trigger(`private-conversation-${conversationId}`, "message-read", {
    conversationId,
    readerId: userId,
    count: result.count,
  });

  return {
    ok: true,
    message: "Messages marques comme lus.",
    data: {
      count: result.count,
    },
  };
}
