import { revalidatePath } from "next/cache";

import { deletePost, getAllPosts } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PostsPageProps = {
  searchParams?: { page?: string; search?: string };
};

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const page = Number(searchParams?.page ?? 1);
  const search = searchParams?.search;
  const data = await getAllPosts({ page, limit: 20, search });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Annonces</h2>
        <p className="text-sm text-muted-foreground">Gestion et suppression des annonces.</p>
      </div>

      <div className="space-y-4">
        {data.posts.map((post) => (
          <Card key={post.id} className="border-border/80">
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.city} • {post.sport.name}</p>
                <p className="text-sm text-muted-foreground">Auteur: {post.author.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("postId")?.toString() ?? "";
                    await deletePost(id);
                    revalidatePath("/admin/posts");
                  }}>
                  <input type="hidden" name="postId" value={post.id} />
                  <Button type="submit" variant="destructive">Supprimer</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
