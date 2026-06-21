import Pusher from "pusher-js";

export function createPusherClient() {
  if (typeof window === "undefined") {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_PUSHER_KEY environment variable.");
  }

  return new Pusher(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
    auth: {
      headers: {
        "Content-Type": "application/json",
      },
    },
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });
}
