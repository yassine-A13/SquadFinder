import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getPosts } from "@/server/actions/posts";
import { AnnouncementCard } from "@/components/shared/announcement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const [sports, latestPosts, usersCount, postsCount, citiesCount] = await Promise.all([
    prisma.sport.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getPosts({ sort: "recent" }),
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.findMany({
      distinct: ["city"],
      select: { city: true },
    }),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24">
      <section className="surface-dark relative isolate overflow-hidden rounded-3xl px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20">
        <div className="absolute -left-16 -top-16 -z-10 size-64 rounded-full border-[40px] border-primary/10" />
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-300">TEAMMATCH · PLAY TOGETHER</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-.05em] text-white sm:text-6xl lg:text-7xl">
          Trouve ton équipe. Trouve des joueurs. Organise tes matchs.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-secondary-300 sm:text-lg">
          Rejoins la plateforme sportive premium pour creer des annonces, chercher des joueurs et connecter tes equipes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/annonces">
            <Button size="lg" variant="premium">Trouver une équipe</Button>
          </Link>
          <Link href="/annonces?type=PLAYER_LOOKING_TEAM">
            <Button className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-secondary-900" size="lg" variant="outline">Trouver des joueurs</Button>
          </Link>
          <Link href="/creer-annonce">
            <Button className="bg-white text-secondary-900 hover:bg-primary-50" size="lg" variant="secondary">Créer une annonce</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="sport-label">Comment ça marche</p>
          <h2 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">Trois étapes pour lancer ton prochain match</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Publie une annonce",
              description: "Décris ton match, ton niveau et les joueurs recherchés.",
            },
            {
              title: "Trouve des talents",
              description: "Utilise les filtres pour découvrir les profils et les sports populaires.",
            },
            {
              title: "Organise ton équipe",
              description: "Sélectionne les candidats et finalise ton effectif avant le jour J.",
            },
          ].map((step, index) => (
            <Card key={step.title} className="relative overflow-visible hover:-translate-y-1 hover:shadow-lift">
              <CardHeader>
                <span className="mb-3 grid size-10 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-md shadow-primary/25">0{index + 1}</span>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sport-label">Sports populaires</p>
            <h2 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">Choisis ton sport et filtre les annonces</h2>
          </div>
          <Button variant="outline">Découvrir tous les sports</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {sports.map((sport) => (
            <Link
              href={`/annonces?sport=${sport.id}`}
              key={sport.id}
              className="group rounded-2xl bg-white p-5 text-left shadow-soft ring-1 ring-secondary-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-50 hover:shadow-lift"
            >
              <h3 className="text-lg font-bold transition-colors group-hover:text-primary">{sport.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Voir les annonces pour ce sport</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-dark grid gap-6 rounded-3xl p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white/10 p-4 text-white ring-white/10 shadow-none backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Statistiques de la plateforme</CardTitle>
            <CardDescription className="text-secondary-300">Un aperçu dynamique de la communauté et des annonces.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 text-center">
              <p className="text-4xl font-semibold text-primary">{usersCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Joueurs inscrits</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center">
              <p className="text-4xl font-semibold text-secondary">{postsCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Annonces actives</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center">
              <p className="text-4xl font-semibold text-emerald-600">{citiesCount.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">Villes actives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white p-4">
          <CardHeader>
            <CardTitle>Témoignages récents</CardTitle>
            <CardDescription>Des membres qui ont trouvé leur équipe grâce à TeamMatch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="rounded-3xl border border-border/70 bg-card p-4">
                <p className="font-semibold">{post.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{post.description.slice(0, 100)}...</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sport-label">Dernières annonces</p>
            <h2 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">Annonces récentes</h2>
          </div>
          <Link href="/annonces">
            <Button variant="outline">Voir toutes</Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {latestPosts.slice(0, 3).map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
