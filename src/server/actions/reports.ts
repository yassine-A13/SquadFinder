"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

const reportSchema = z.object({
  reportedUserId: z.string().min(1, "Identifiant du joueur requis."),
  reason: z.enum(["SPAM", "INAPPROPRIATE", "FAKE_PROFILE"]),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createReport(
  reportedUserId: string,
  reason: "SPAM" | "INAPPROPRIATE" | "FAKE_PROFILE",
  description?: string,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ok: false, message: "Vous devez etre connecte pour signaler un joueur." };
  }

  const parsed = reportSchema.safeParse({ reportedUserId, reason, description });

  if (!parsed.success) {
    return { ok: false, message: "Le signalement est invalide." };
  }

  if (parsed.data.reportedUserId === userId) {
    return { ok: false, message: "Vous ne pouvez pas vous signaler vous-meme." };
  }

  const reportedUser = await prisma.user.findUnique({
    where: { id: parsed.data.reportedUserId },
    select: { id: true },
  });

  if (!reportedUser) {
    return { ok: false, message: "Le joueur signale n'existe pas." };
  }

  await prisma.report.create({
    data: {
      reporterId: userId,
      reportedUserId: parsed.data.reportedUserId,
      reason: parsed.data.reason,
      status: "PENDING",
    },
  });

  return { ok: true, message: "Signalement envoye. Notre equipe va l'examiner." };
}
