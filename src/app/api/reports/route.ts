import { NextResponse } from "next/server";

import { createReport } from "@/server/actions/reports";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await createReport(body.reportedUserId, body.reason, body.description);
  return NextResponse.json(result);
}
