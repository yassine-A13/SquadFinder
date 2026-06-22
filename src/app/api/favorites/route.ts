import { NextResponse } from "next/server";

import { getMyFavoritePostIds, toggleFavorite } from "@/server/actions/favorites";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get("postId");

  if (postId) {
    const favorites = await getMyFavoritePostIds();
    return NextResponse.json({ favorited: favorites.includes(postId) });
  }

  const favorites = await getMyFavoritePostIds();
  return NextResponse.json({ ids: favorites });
}

export async function POST(request: Request) {
  const body = await request.json();
  const postId = body.postId as string;

  const result = await toggleFavorite(postId);
  return NextResponse.json(result);
}
