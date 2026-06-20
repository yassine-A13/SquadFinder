"use server";

import { z } from "zod";

import type { ActionResult } from "@/types";

const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1),
});

export async function sendMessage(
  input: z.infer<typeof sendMessageSchema>,
): Promise<ActionResult<typeof input>> {
  const data = sendMessageSchema.parse(input);

  return {
    ok: true,
    message: "Action prete pour etre branchee a Pusher et Prisma.",
    data,
  };
}
