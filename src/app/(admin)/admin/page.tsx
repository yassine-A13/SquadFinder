import Link from "next/link";

import { getCityDistribution, getGlobalStats, getRegistrationsOverTime, getSportsPopularity } from "@/server/actions/admin";
import { AdminDashboardCharts } from "@/components/shared/AdminDashboardCharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [globalStats, sports, cities, registrations] = await Promise.all([
    getGlobalStats(),
    getSportsPopularity(),
    getCityDistribution(),
    getRegistrationsOverTime(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Joueurs</CardTitle>
            <CardDescription>Utilisateurs totaux</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{globalStats.users}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annonces</CardTitle>
            <CardDescription>Annonces publiees</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{globalStats.posts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Candidatures</CardTitle>
            <CardDescription>Total des demandes</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{globalStats.applications}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Matchs</CardTitle>
            <CardDescription>Matchs organisés terminés</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{globalStats.matches}</CardContent>
        </Card>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Navigation rapide</CardTitle>
          <CardDescription>Accédez aux sections d&apos;administration.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/users">
            <Button>Utilisateurs</Button>
          </Link>
          <Link href="/admin/posts">
            <Button>Annonces</Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline">Signalements</Button>
          </Link>
        </CardContent>
      </Card>

      <AdminDashboardCharts sports={sports} cities={cities} registrations={registrations} />
    </div>
  );
}
