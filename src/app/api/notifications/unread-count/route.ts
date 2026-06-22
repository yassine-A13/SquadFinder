import { NextResponse } from "next/server";

import { getUnreadCount } from "@/server/actions/notifications";

export async function GET() {
  const count = await getUnreadCount();
  return NextResponse.json({ count });
}
