import { NextResponse } from "next/server";

import { markAsRead } from "@/server/actions/messages";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const result = await markAsRead(conversationId);
  return NextResponse.json(result);
}
