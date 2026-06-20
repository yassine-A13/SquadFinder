import { NextResponse } from "next/server";

import { getPosts } from "@/server/actions/posts";
import { postsFiltersSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = postsFiltersSchema.safeParse({
    sport: searchParams.get("sport") || undefined,
    city: searchParams.get("city") || undefined,
    level: searchParams.get("level") || undefined,
    date: searchParams.get("date") || undefined,
    type: searchParams.get("type") || undefined,
    sort: searchParams.get("sort") || undefined,
  });

  const announcements = await getPosts(parsed.success ? parsed.data : {});

  return NextResponse.json(announcements);
}
