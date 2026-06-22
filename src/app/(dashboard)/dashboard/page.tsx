import Link from "next/link";
import { Activity, Bell, Calendar, FileText, MessageSquare, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardStats, getUpcomingMatches } from "@/server/actions/dashboard";
import { getNotifications } from "@/server/actions/notifications";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = await getDashboardStats();
  const upcomingMatches = await getUpcomingMatches();
  const { notifications } = await getNotifications(1, 5, "ALL");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Bienvenue, {user?.name ?? "Joueur"} !</h2>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité sur TeamMatch</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces actives</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePosts}</div>
            <p className="text-xs text-muted-foreground">Annonces ouvertes actuellement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatures en attente</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Candidatures à traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations à traiter</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invitations}</div>
            <p className="text-xs text-muted-foreground">Réponses à donner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Nouveaux messages</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
