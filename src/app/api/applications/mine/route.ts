import { NextResponse } from "next/server";

import { getMyApplications } from "@/server/actions/applications";

export async function GET() {
  const applications = await getMyApplications();
  return NextResponse.json(applications);
}
