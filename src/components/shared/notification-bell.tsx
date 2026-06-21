"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, Check, Mail } from "lucide-react";

import { createPusherClient } from "@/lib/pusher/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

async function fetchNotifications(filter: string) {
  const params = new URLSearchParams({ filter, page: "1", limit: "5" });
  const response = await fetch(`/api/notifications?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Impossible de charger les notifications.");
  }
  return (await response.json()) as { notifications: NotificationItem[]; total: number };
}

async function fetchUnreadCount() {
  const response = await fetch("/api/notifications/unread-count");
  if (!response.ok) {
    throw new Error("Impossible de charger le nombre de notifications non lues.");
  }
  return (await response.json()) as { count: number };
}

export function NotificationBell() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "ALL"],
    queryFn: () => fetchNotifications("ALL"),
  });

  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
  });

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const pusher = createPusherClient();
    if (!pusher) {
      return;
    }

    const channel = pusher.subscribe(`private-user-${session.user.id}`);
    channel.bind("new-notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "ALL"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [queryClient, session?.user?.id]);

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadQuery.data?.count ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
            {unreadQuery.data.count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-popover p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">Dernieres mises a jour en temps reel</p>
            </div>
            <Link href="/dashboard/notifications" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {notificationsQuery.data?.notifications.length ? (
              notificationsQuery.data.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-xl border border-border p-3",
                    notification.isRead ? "bg-background" : "bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p className="text-sm font-semibold">{notification.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.content}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(notification.createdAt).toLocaleString("fr-FR")}</span>
                    {notification.isRead ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Check className="h-3.5 w-3.5" /> Lu
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                Aucune notification recente.
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={async () => {
                await fetch("/api/notifications/mark-all-as-read", { method: "POST" });
                queryClient.invalidateQueries({ queryKey: ["notifications", "ALL"] });
                queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
              }}
              type="button"
            >
              Marquer tout comme lu
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
