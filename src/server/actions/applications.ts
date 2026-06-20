"use server";

import { z } from "zod";

import type { ActionResult } from "@/types";

const applyToSquadSchema = z.object({
  announcementId: z.string().min(1),
  message: z.string().min(10),
});

export async function applyToSquad(
  input: z.infer<typeof applyToSquadSchema>,
): Promise<ActionResult<typeof input>> {
  const data = applyToSquadSchema.parse(input);

  return {
    ok: true,
    message: "Action prete pour enregistrer une candidature.",
    data,
  };
}
