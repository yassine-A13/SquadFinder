import { Gender, Level, PostStatus, PostType, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.application.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userSport.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sport.deleteMany();

  const sports = await Promise.all([
    prisma.sport.create({ data: { name: "Football", icon: "football" } }),
    prisma.sport.create({ data: { name: "Padel", icon: "racket" } }),
    prisma.sport.create({ data: { name: "Tennis", icon: "tennis" } }),
    prisma.sport.create({ data: { name: "Basketball", icon: "basketball" } }),
    prisma.sport.create({ data: { name: "Volleyball", icon: "volleyball" } }),
    prisma.sport.create({ data: { name: "Running", icon: "running" } }),
    prisma.sport.create({ data: { name: "Handball", icon: "handball" } }),
  ]);

  const sportByName = Object.fromEntries(sports.map((sport) => [sport.name, sport]));

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Yassine Cheraa",
        email: "yassine@teammatch.test",
        password: "password123",
        image: "https://i.pravatar.cc/150?img=12",
        role: Role.ADMIN,
        profile: {
          create: {
            city: "Casablanca",
            age: 25,
            gender: Gender.MALE,
            bio: "Organisateur de matchs et amateur de football en salle.",
            availability: "Soirs de semaine et week-ends",
          },
        },
        sports: {
          create: [
            { sportId: sportByName.Football.id, level: Level.ADVANCED },
            { sportId: sportByName.Padel.id, level: Level.INTERMEDIATE },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Sara El Amrani",
        email: "sara@teammatch.test",
        password: "password123",
        image: "https://i.pravatar.cc/150?img=32",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Rabat",
            age: 23,
            gender: Gender.FEMALE,
            bio: "Joueuse de tennis et de padel, disponible pour des matchs le week-end.",
            availability: "Week-ends",
          },
        },
        sports: {
          create: [
            { sportId: sportByName.Tennis.id, level: Level.ADVANCED },
            { sportId: sportByName.Padel.id, level: Level.ADVANCED },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Amine Bennis",
        email: "amine@teammatch.test",
        password: "password123",
        image: "https://i.pravatar.cc/150?img=18",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Marrakech",
            age: 27,
            gender: Gender.MALE,
            bio: "Pivot basket et passionne de handball.",
            availability: "Apres 19h tous les jours",
          },
        },
        sports: {
          create: [
            { sportId: sportByName.Basketball.id, level: Level.EXPERT },
            { sportId: sportByName.Handball.id, level: Level.INTERMEDIATE },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Nadia Rami",
        email: "nadia@teammatch.test",
        password: "password123",
        image: "https://i.pravatar.cc/150?img=47",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Agadir",
            age: 24,
            gender: Gender.FEMALE,
            bio: "Coureuse reguliere et joueuse de volleyball en loisir.",
            availability: "Matins et dimanches",
          },
        },
        sports: {
          create: [
            { sportId: sportByName.Running.id, level: Level.EXPERT },
            { sportId: sportByName.Volleyball.id, level: Level.INTERMEDIATE },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Omar Tazi",
        email: "omar@teammatch.test",
        password: "password123",
        image: "https://i.pravatar.cc/150?img=61",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Tangier",
            age: 29,
            gender: Gender.MALE,
            bio: "Cherche surtout des equipes de football et de handball competitives.",
            availability: "Lundi, mercredi, samedi",
          },
        },
        sports: {
          create: [
            { sportId: sportByName.Football.id, level: Level.INTERMEDIATE },
            { sportId: sportByName.Handball.id, level: Level.ADVANCED },
          ],
        },
      },
    }),
  ]);

  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

  await prisma.post.createMany({
    data: [
      {
        authorId: userByEmail["yassine@teammatch.test"].id,
        sportId: sportByName.Football.id,
        title: "Equipe de foot a 5 cherche gardien",
        description:
          "Nous jouons tous les mercredis soir a Casablanca et il nous manque un gardien fiable.",
        city: "Casablanca",
        matchDate: new Date("2026-06-24T00:00:00.000Z"),
        matchTime: "20:30",
        requiredLevel: Level.INTERMEDIATE,
        playersNeeded: 1,
        type: PostType.TEAM_LOOKING_PLAYER,
        status: PostStatus.OPEN,
      },
      {
        authorId: userByEmail["sara@teammatch.test"].id,
        sportId: sportByName.Padel.id,
        title: "Joueuse de padel cherche equipe pour tournoi",
        description:
          "Je cherche une equipe serieuse pour un tournoi amateur le mois prochain a Rabat.",
        city: "Rabat",
        matchDate: new Date("2026-07-05T00:00:00.000Z"),
        matchTime: "10:00",
        requiredLevel: Level.ADVANCED,
        playersNeeded: 2,
        type: PostType.PLAYER_LOOKING_TEAM,
        status: PostStatus.OPEN,
      },
      {
        authorId: userByEmail["amine@teammatch.test"].id,
        sportId: sportByName.Basketball.id,
        title: "Roster basket 3x3 cherche ailier",
        description:
          "Petit groupe motive pour des tournois 3x3 en soiree, bonne defense exigee.",
        city: "Marrakech",
        matchDate: new Date("2026-06-28T00:00:00.000Z"),
        matchTime: "19:15",
        requiredLevel: Level.ADVANCED,
        playersNeeded: 1,
        type: PostType.TEAM_LOOKING_PLAYER,
        status: PostStatus.OPEN,
      },
      {
        authorId: userByEmail["nadia@teammatch.test"].id,
        sportId: sportByName.Running.id,
        title: "Coureuse cherche groupe pour semi-marathon",
        description:
          "Je cherche un groupe d'entrainement pour preparer un semi-marathon a allure reguliere.",
        city: "Agadir",
        matchDate: new Date("2026-07-12T00:00:00.000Z"),
        matchTime: "07:00",
        requiredLevel: Level.INTERMEDIATE,
        playersNeeded: 4,
        type: PostType.PLAYER_LOOKING_TEAM,
        status: PostStatus.OPEN,
      },
      {
        authorId: userByEmail["omar@teammatch.test"].id,
        sportId: sportByName.Handball.id,
        title: "Equipe handball universitaire cherche arriere",
        description:
          "Recherche joueur rapide pour completer l'effectif avant reprise du championnat local.",
        city: "Tangier",
        matchDate: new Date("2026-06-30T00:00:00.000Z"),
        matchTime: "18:45",
        requiredLevel: Level.ADVANCED,
        playersNeeded: 1,
        type: PostType.TEAM_LOOKING_PLAYER,
        status: PostStatus.OPEN,
      },
    ],
  });

  console.log("Seed TeamMatch termine.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
