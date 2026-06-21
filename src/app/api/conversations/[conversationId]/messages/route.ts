import { NextResponse } from "next/server";

import { getMessages } from "@/server/actions/messages";

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "30");

  const messages = await getMessages(conversationId, page, limit);
  return NextResponse.json(messages);
}
