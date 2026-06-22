import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applicationId = new URL(request.url).searchParams.get("applicationId");
  if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true, userId: true, post: { select: { authorId: true } } },
  });

  if (
    !application ||
    application.status !== "ACCEPTED" ||
    (application.userId !== user.id && application.post.authorId !== user.id)
  ) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const participantIds = [application.userId, application.post.authorId];
  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId: participantIds[0] } } },
    include: { members: { select: { userId: true } } },
  });
  const conversation = conversations.find((item) => {
    const memberIds = item.members.map((member) => member.userId);
    return memberIds.length === 2 && participantIds.every((id) => memberIds.includes(id));
  });

  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ conversationId: conversation.id });
}
