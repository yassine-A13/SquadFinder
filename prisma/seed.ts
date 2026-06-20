import { hash } from "bcrypt";
import { Gender, Level, PostStatus, PostType, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 10);

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
        name: "Ayoub Joueur",
        email: "ayoub@teammatch.test",
        password: passwordHash,
        image: "https://i.pravatar.cc/150?img=12",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Casablanca",
            age: 24,
            gender: Gender.MALE,
            bio: "Milieu de terrain disponible pour rejoindre une equipe reguliere.",
            availability: "Soirs de semaine et week-ends",
          },
        },
        sports: {
          create: [{ sportId: sportByName.Football.id, level: Level.ADVANCED }],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Equipe Atlas",
        email: "atlas@teammatch.test",
        password: passwordHash,
        image: "https://i.pravatar.cc/150?img=32",
        role: Role.PLAYER,
        profile: {
          create: {
            city: "Rabat",
            age: 28,
            gender: Gender.OTHER,
            bio: "Equipe amateur organisee qui cherche un joueur pour completer son effectif.",
            availability: "Week-ends et mardis soirs",
          },
        },
        sports: {
          create: [{ sportId: sportByName.Football.id, level: Level.INTERMEDIATE }],
        },
      },
    }),
  ]);

  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

  await prisma.post.createMany({
    data: [
      {
        authorId: userByEmail["ayoub@teammatch.test"].id,
        sportId: sportByName.Football.id,
        title: "Joueur cherche une equipe de foot a 5",
        description:
          "Je cherche une equipe serieuse a Casablanca pour jouer chaque semaine. Je peux jouer milieu ou ailier.",
        city: "Casablanca",
        matchDate: new Date("2026-06-24T00:00:00.000Z"),
        matchTime: "20:30",
        requiredLevel: Level.ADVANCED,
        playersNeeded: 1,
        type: PostType.PLAYER_LOOKING_TEAM,
        status: PostStatus.OPEN,
      },
      {
        authorId: userByEmail["atlas@teammatch.test"].id,
        sportId: sportByName.Football.id,
        title: "Equipe cherche un joueur pour completer l'effectif",
        description:
          "Nous cherchons un joueur motive pour rejoindre notre groupe a Rabat pour matchs et entrainements.",
        city: "Rabat",
        matchDate: new Date("2026-06-28T00:00:00.000Z"),
        matchTime: "19:30",
        requiredLevel: Level.INTERMEDIATE,
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
