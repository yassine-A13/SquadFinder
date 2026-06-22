"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import type { ActionResult } from "@/types";

const notificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  filter: z.enum(["ALL", "UNREAD", "READ"]).default("ALL"),
});

export async function getNotifications(
  page = 1,
  limit = 20,
  filter: "ALL" | "UNREAD" | "READ" = "ALL",
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { notifications: [], total: 0 };
  }

  const parsed = notificationsQuerySchema.parse({ page, limit, filter });

  const where: Record<string, unknown> = {
    userId,
  };

  if (parsed.filter === "UNREAD") {
    Object.assign(where, { isRead: false });
  }

  if (parsed.filter === "READ") {
    Object.assign(where, { isRead: true });
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parsed.page - 1) * parsed.limit,
      take: parsed.limit,
    }),
    prisma.notification.count({
      where,
    }),
  ]);

  return {
    notifications: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    })),
    total,
  };
}

export async function markNotificationAsRead(
  id: string,
): Promise<ActionResult<null>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour marquer une notification comme lue.",
    };
  }

  const notification = await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
    },
  });

  if (notification.count === 0) {
    return {
      ok: false,
      message: "Notification introuvable ou acces refuse.",
    };
  }

  return {
    ok: true,
    message: "Notification marquee comme lue.",
  };
}

export async function markAllAsRead(): Promise<ActionResult<null>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      ok: false,
      message: "Vous devez etre connecte pour marquer les notifications.",
    };
  }

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    ok: true,
    message: "Toutes les notifications ont ete marquees comme lues.",
  };
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}
