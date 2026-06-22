import { NextResponse } from "next/server";

import { createReview } from "@/server/actions/reviews";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await createReview(
    body.reviewedUserId,
    body.postId,
    Number(body.rating),
    body.comment,
  );

  return NextResponse.json(result);
}
