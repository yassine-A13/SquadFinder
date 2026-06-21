import { NextResponse } from "next/server";

import { getNotifications } from "@/server/actions/notifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const filter = (searchParams.get("filter") ?? "ALL") as "ALL" | "UNREAD" | "READ";

  const result = await getNotifications(page, limit, filter);
  return NextResponse.json(result);
}
