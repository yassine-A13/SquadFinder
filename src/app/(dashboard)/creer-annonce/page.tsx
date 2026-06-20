import { redirect } from "next/navigation";

import { PostForm } from "@/components/shared/post-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreatePostPageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function CreatePostPage({ searchParams }: CreatePostPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const editId = resolvedSearchParams.edit;

  const [sports, post] = await Promise.all([
    prisma.sport.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    editId
      ? prisma.post.findFirst({
          where: { id: editId, authorId: session.user.id },
          select: {
            id: true,
            title: true,
            description: true,
            sportId: true,
            city: true,
            matchDate: true,
            matchTime: true,
            requiredLevel: true,
            playersNeeded: true,
            type: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <PostForm
      initialValues={
        post
          ? {
              title: post.title,
              description: post.description,
              sportId: post.sportId,
              city: post.city,
              matchDate: post.matchDate.toISOString().slice(0, 10),
              matchTime: post.matchTime,
              requiredLevel: post.requiredLevel,
              playersNeeded: post.playersNeeded,
              type: post.type,
            }
          : undefined
      }
      mode={post ? "edit" : "create"}
      postId={post?.id}
      sports={sports}
    />
  );
}
