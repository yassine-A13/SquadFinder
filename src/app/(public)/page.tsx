import Link from "next/link";

import { getPosts } from "@/server/actions/posts";
import { AnnouncementCard } from "@/components/shared/announcement-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const latestPosts = await getPosts({ sort: "recent" });

  return (
    <div className="space-y-10">
      

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Apercu des annonces</h2>
          <p className="text-sm text-muted-foreground">
            Cette liste charge les annonces ouvertes en temps reel depuis la base.
          </p>
        </div>
        {latestPosts.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestPosts.slice(0, 3).map((announcement) => (
              <AnnouncementCard announcement={announcement} key={announcement.id} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune annonce publique pour le moment.</p>
        )}
      </section>
    </div>
  );
}
