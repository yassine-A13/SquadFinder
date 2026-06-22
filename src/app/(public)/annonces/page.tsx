import { AnnouncementsFeed } from "@/components/shared/announcements-feed";
import { prisma } from "@/lib/prisma";

type AnnouncementsPageProps = {
  searchParams?: {
    sport?: string;
    city?: string;
    level?: string;
    date?: string;
    type?: string;
    sort?: "recent" | "matchDate" | "popular";
  };
};

export default async function AnnouncementsPage({ searchParams }: AnnouncementsPageProps) {
  const [sports, cities] = await Promise.all([
    prisma.sport.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.post.findMany({
      where: { status: "OPEN" },
      distinct: ["city"],
      orderBy: { city: "asc" },
      select: { city: true },
    }),
  ]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Annonces publiques</h2>
        <p className="text-sm text-muted-foreground">
          Les annonces affichees ici viennent maintenant de la base de donnees.
        </p>
      </div>
      <AnnouncementsFeed
        cities={cities.map((item) => item.city)}
        sports={sports}
        initialFilters={{
          sport: searchParams?.sport ?? "all",
          city: searchParams?.city ?? "all",
          level: searchParams?.level ?? "all",
          date: searchParams?.date ?? "",
          type: searchParams?.type ?? "all",
          sort: searchParams?.sort ?? "recent",
        }}
      />
    </section>
  );
}
