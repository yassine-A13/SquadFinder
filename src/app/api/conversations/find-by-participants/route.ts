import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("otherUserId");

  if (!otherUserId) {
    return NextResponse.json({ error: "Missing otherUserId" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
      AND: {
        members: {
          some: {
            userId: otherUserId,
          },
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const memberIds = conversation.members.map((m) => m.userId);
  if (memberIds.length === 2 && memberIds.includes(user.id) && memberIds.includes(otherUserId)) {
    return NextResponse.json({ conversationId: conversation.id });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
