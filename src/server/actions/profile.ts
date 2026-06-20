"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { Gender, Level } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addUserSportSchema,
  profileSchema,
  uploadProfileImageSchema,
} from "@/lib/validators";

function normalizeOptionalText(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
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
  });
}

export async function updateProfile(data: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non connecte.");
  }

  const parsed = profileSchema.safeParse({
    city: data.get("city"),
    age: data.get("age"),
    gender: data.get("gender"),
    bio: data.get("bio"),
    availability: data.get("availability"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const profileData = {
    city: parsed.data.city,
    age: parsed.data.age,
    gender: parsed.data.gender as Gender,
    bio: normalizeOptionalText(parsed.data.bio),
    availability: normalizeOptionalText(parsed.data.availability),
  };

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: profileData,
    create: {
      userId: session.user.id,
      ...profileData,
    },
  });

  return {
    success: true,
    message: "Profil mis a jour.",
  };
}

export async function addUserSport(sportId: string, level: Level | string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non connecte.");
  }

  const parsed = addUserSportSchema.safeParse({ sportId, level });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.userSport.upsert({
    where: {
      userId_sportId: {
        userId: session.user.id,
        sportId: parsed.data.sportId,
      },
    },
    update: {
      level: parsed.data.level,
    },
    create: {
      userId: session.user.id,
      sportId: parsed.data.sportId,
      level: parsed.data.level,
    },
  });

  return {
    success: true,
    message: "Sport ajoute ou mis a jour.",
  };
}

export async function removeUserSport(sportId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non connecte.");
  }

  await prisma.userSport.deleteMany({
    where: {
      userId: session.user.id,
      sportId,
    },
  });

  return {
    success: true,
    message: "Sport supprime.",
  };
}

export async function uploadProfileImage(file: File) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non connecte.");
  }

  const parsed = uploadProfileImageSchema.safeParse({ file });

  if (!parsed.success) {
    return {
      success: false,
      message: "Fichier invalide.",
    };
  }

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await parsed.data.file.arrayBuffer());
  const extension = parsed.data.file.name.split(".").pop() ?? "jpg";
  const filename = `${session.user.id}-${randomUUID()}.${extension}`;
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/${filename}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  return {
    success: true,
    message: "Photo de profil mise a jour.",
    imageUrl,
  };
}
