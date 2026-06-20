import { MyPostsList } from "@/components/shared/my-posts-list";
import { getMyPosts } from "@/server/actions/posts";

export default async function MyPostsPage() {
  const posts = await getMyPosts();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes annonces</h2>
        <p className="text-sm text-muted-foreground">
          Retrouvez ici vos annonces, leur statut et le nombre de candidatures recues.
        </p>
      </div>
      <MyPostsList posts={posts} />
    </section>
  );
}
