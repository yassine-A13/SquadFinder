import { PrismaClient } from "@prisma/client";
import { serverPusher } from "@/lib/pusher/server";

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      notification: {
        async create({ args, query }) {
          const notification = await query(args);

          // Legacy application actions insert directly with Prisma and cannot be changed here.
          if (notification.type === "APPLICATION") {
            try {
              await serverPusher.trigger(
                `private-user-${notification.userId}`,
                "new-notification",
                {
                  notification: {
                    ...notification,
                    createdAt: String(notification.createdAt),
                  },
                },
              );
            } catch (error) {
              console.error("Unable to send application notification with Pusher", error);
            }
          }

          return notification;
        },
      },
    },
  });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
