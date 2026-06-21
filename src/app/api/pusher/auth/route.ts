import { NextResponse } from "next/server";

import { serverPusher } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const socketId = body?.socket_id ?? body?.socketId ?? new URL(request.url).searchParams.get("socket_id");
  const channelName = body?.channel_name ?? body?.channelName ?? new URL(request.url).searchParams.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing socket_id or channel_name." },
      { status: 400 },
    );
  }

  if (channelName.startsWith("private-conversation-")) {
    const conversationId = channelName.replace("private-conversation-", "");
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (channelName.startsWith("private-user-")) {
    const userId = channelName.replace("private-user-", "");
    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Forbidden channel." }, { status: 403 });
  }

  const authResponse = serverPusher.authenticate(socketId, channelName);
  return NextResponse.json(authResponse);
}
