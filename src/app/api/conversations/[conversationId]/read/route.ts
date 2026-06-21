import { NextResponse } from "next/server";

import { markAsRead } from "@/server/actions/messages";

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } },
) {
  const { conversationId } = params;
  const result = await markAsRead(conversationId);
  return NextResponse.json(result);
}
