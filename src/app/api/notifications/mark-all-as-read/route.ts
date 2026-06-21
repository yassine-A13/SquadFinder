import { NextResponse } from "next/server";

import { markAllAsRead } from "@/server/actions/notifications";

export async function POST() {
  const result = await markAllAsRead();
  return NextResponse.json(result);
}
