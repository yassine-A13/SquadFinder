import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApplicationListItem } from "@/server/actions/applications";

function badgeVariant(status: ApplicationListItem["status"]) {
  if (status === "ACCEPTED") return "default";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

export function MyApplicationsList({ applications }: { applications: ApplicationListItem[] }) {
  if (!applications.length) {
    return <p className="text-sm text-muted-foreground">Aucune candidature envoyee pour le moment.</p>;
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={badgeVariant(application.status)}>{application.status}</Badge>
            </div>
            <CardTitle>{application.post.title}</CardTitle>
            <CardDescription>
              {application.post.city} • {new Date(application.post.matchDate).toLocaleDateString("fr-FR")} a{" "}
              {application.post.matchTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Candidature envoyee le {new Date(application.createdAt).toLocaleDateString("fr-FR")}</span>
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={`/annonces/${application.post.id}`}>
              Voir l&apos;annonce
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
