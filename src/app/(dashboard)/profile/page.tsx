import { redirect } from "next/navigation";

import { ProfileSettings } from "@/components/shared/profile-settings";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, sports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        image: true,
        profile: true,
        sports: {
          select: {
            id: true,
            level: true,
            sport: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    }),
    prisma.sport.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return <ProfileSettings sports={sports} user={user} />;
}
