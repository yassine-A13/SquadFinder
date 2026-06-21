import { NextResponse } from "next/server";

import { getConversations } from "@/server/actions/messages";

export async function GET() {
  const conversations = await getConversations();
  return NextResponse.json(conversations);
}
