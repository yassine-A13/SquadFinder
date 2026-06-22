"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

async function fetchNotifications(filter: string, page: number) {
  const params = new URLSearchParams({ filter, page: String(page), limit: "20" });
  const response = await fetch(`/api/notifications?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Impossible de charger les notifications.");
  }
  return (await response.json()) as { notifications: NotificationItem[]; total: number };
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["notifications", filter, page],
    queryFn: () => fetchNotifications(filter, page),
  });

  const handleMarkAsRead = async (id: string) => {
    const response = await fetch(`/api/notifications/${id}/mark-as-read`, { method: "POST" });
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await fetch("/api/notifications/mark-all-as-read", { method: "POST" });
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground">Retrouvez ici toutes vos notifications en temps réel.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Historique</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => {
                setFilter("ALL");
                setPage(1);
              }}
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={filter === "UNREAD" ? "default" : "outline"}
              onClick={() => {
                setFilter("UNREAD");
                setPage(1);
              }}
              size="sm"
            >
              Non lues
            </Button>
            <Button
              variant={filter === "READ" ? "default" : "outline"}
              onClick={() => {
                setFilter("READ");
                setPage(1);
              }}
              size="sm"
            >
              Lues
            </Button>
            <Button onClick={handleMarkAllAsRead} variant="ghost" size="sm">
              Tout marquer comme lu
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {query.isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement des notifications...</div>
          ) : query.data?.notifications.length ? (
            query.data.notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start justify-between rounded-xl border border-border p-4",
                  notification.isRead ? "bg-background" : "bg-muted",
                )}
              >
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
                {!notification.isRead ? (
                  <Button
                    onClick={() => handleMarkAsRead(notification.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Check className="h-4 w-4" />
                    Marquer comme lu
                  </Button>
                ) : (
                  <span className="text-xs text-green-600">Lu</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Aucune notification pour le moment.
            </div>
          )}

          {query.data && query.data.total > 20 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Precedent
              </Button>
              <span className="text-sm">
                Page {page} / {Math.ceil(query.data.total / 20)}
              </span>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(query.data.total / 20)}
                variant="outline"
                size="sm"
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
