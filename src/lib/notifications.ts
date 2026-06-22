import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serverPusher } from "@/lib/pusher/server";

export async function createNotification(
  userId: string,
  title: string,
  content: string,
  type: NotificationType,
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      content,
      type,
    },
  });

  try {
    await serverPusher.trigger(
      `private-user-${userId}`,
      "new-notification",
      {
        notification: {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
        },
      },
    );
  } catch (error) {
    console.error("Unable to send Pusher notification", error);
  }

  return notification;
}
