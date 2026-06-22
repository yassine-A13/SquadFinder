import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function createPusherClient() {
  if (typeof window === "undefined") {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error("Missing public Pusher environment variables.");
  }

  if (pusherClient) {
    return pusherClient;
  }

  pusherClient = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });

  return pusherClient;
}
