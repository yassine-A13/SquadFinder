import { NextResponse } from "next/server";

import { markNotificationAsRead } from "@/server/actions/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const { notificationId } = await params;
  const result = await markNotificationAsRead(notificationId);
  return NextResponse.json(result);
}
