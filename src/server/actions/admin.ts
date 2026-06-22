"use server";

import { z } from "zod";

import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

const paginationSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().int().min(1)).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().min(1)).optional(),
  search: z.string().trim().optional(),
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]).optional(),
});

const reportResolveSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["DISMISS", "RESOLVE", "BAN"]),
});

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Acces refuse. Admin uniquement.");
  }

  return session.user.id;
}

export async function getGlobalStats() {
  await requireAdmin();

  const [users, posts, applications, matches] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.application.count(),
    prisma.post.count({
      where: {
        matchDate: { lt: new Date() },
        applications: {
          some: {
            status: "ACCEPTED",
          },
        },
      },
    }),
  ]);

  return { users, posts, applications, matches };
}

export async function getSportsPopularity() {
  await requireAdmin();

  return prisma.sport.findMany({
    orderBy: [{ posts: { _count: "desc" } }],
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
}

export async function getCityDistribution() {
  await requireAdmin();

  const cities = await prisma.post.groupBy({
    by: ["city"],
    _count: { _all: true },
  });

  return cities.map((city) => ({
    city: city.city ?? "Inconnue",
    count: city._count._all,
  }));
}

export async function getRegistrationsOverTime() {
  await requireAdmin();

  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: twelveMonthsAgo },
    },
    select: {
      createdAt: true,
    },
  });

  const months = Array.from({ length: 12 }).map((_, index) => {
    const date = new Date(twelveMonthsAgo);
    date.setMonth(twelveMonthsAgo.getMonth() + index);
    return {
      label: date.toLocaleString("fr-FR", { month: "short", year: "numeric" }),
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      count: 0,
    };
  });

  const counts = users.reduce<Record<string, number>>((acc, user) => {
    const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return months.map((month) => ({
    month: month.label,
    registrations: counts[month.key] ?? 0,
  }));
}

export async function getAllUsers(filters?: { page?: number; limit?: number; search?: string }) {
  await requireAdmin();

  const parsed = paginationSchema.safeParse(filters ?? {});
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;
  const search = parsed.success ? parsed.data.search : undefined;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, totalCount, page, limit };
}

export async function banUser(userId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!userId) {
    return { ok: false, message: "Identifiant utilisateur requis." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { ok: false, message: "Utilisateur introuvable." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "PLAYER",
    },
  });

  return { ok: true, message: "Utilisateur signale comme bannable." };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!userId) {
    return { ok: false, message: "Identifiant utilisateur requis." };
  }

  await prisma.user.delete({ where: { id: userId } });

  return { ok: true, message: "Utilisateur supprime." };
}

type AdminPostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    sport: { select: { name: true } };
  };
}>;

export async function getAllPosts(filters?: { page?: number; limit?: number; search?: string }): Promise<{
  posts: AdminPostWithRelations[];
  totalCount: number;
  page: number;
  limit: number;
}> {
  await requireAdmin();

  const parsed = paginationSchema.safeParse(filters ?? {});
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;
  const search = parsed.success ? parsed.data.search : undefined;

  const where: Prisma.PostWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true } },
        sport: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalCount, page, limit };
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id) {
    return { ok: false, message: "Identifiant de l'annonce requis." };
  }

  await prisma.post.delete({ where: { id } });

  return { ok: true, message: "Annonce supprimee." };
}

export async function getAllReports(filters?: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "RESOLVED" | "DISMISSED";
}) {
  await requireAdmin();

  const parsed = paginationSchema.safeParse(filters ?? {});
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;
  const status = parsed.success ? parsed.data.status : undefined;

  const where = status ? { status } : {};

  const [reports, totalCount] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, totalCount, page, limit };
}

export async function resolveReport(
  reportId: string,
  action: "DISMISS" | "RESOLVE" | "BAN",
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reportResolveSchema.safeParse({ reportId, action });

  if (!parsed.success) {
    return { ok: false, message: "Action de moderation invalide." };
  }

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
    include: { reportedUser: true },
  });

  if (!report) {
    return { ok: false, message: "Signalement introuvable." };
  }

  if (parsed.data.action === "BAN") {
    await prisma.notification.create({
      data: {
        userId: report.reportedUserId,
        title: "Action administrative",
        content: "Votre compte fait l'objet d'une revue administrative.",
        type: "SYSTEM",
      },
    });
  }

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: parsed.data.action === "DISMISS" ? "DISMISSED" : "RESOLVED",
    },
  });

  return {
    ok: true,
    message: `Signalement ${parsed.data.action === "DISMISS" ? "ignore" : "resolu"}.`,
  };
}
