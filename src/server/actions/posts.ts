"use server";

import { z } from "zod";

import type { ActionResult } from "@/types";

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
});

export async function createPost(
  input: z.infer<typeof createPostSchema>,
): Promise<ActionResult<typeof input>> {
  const data = createPostSchema.parse(input);

  return {
    ok: true,
    message: "Action prete. Connectez-la maintenant a Prisma.",
    data,
  };
}
