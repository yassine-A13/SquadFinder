import { NextResponse } from "next/server";

import { getReceivedApplications } from "@/server/actions/applications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId") ?? undefined;
  const applications = await getReceivedApplications(postId);
  return NextResponse.json(applications);
}
