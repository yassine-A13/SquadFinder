 "use client";

import { useTransition } from "react";

import Link from "next/link";

import { closePost, deletePost } from "@/server/actions/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Announcement } from "@/types";

export function MyPostsList({ posts }: { posts: Announcement[] }) {
  const [isPending, startTransition] = useTransition();

  if (!posts.length) {
    return <p className="text-sm text-muted-foreground">Vous n&apos;avez pas encore publie d&apos;annonce.</p>;
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{post.game}</Badge>
                <Badge variant={post.status === "OPEN" ? "default" : "outline"}>{post.status}</Badge>
              </div>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                {post.city} • {new Date(post.matchDate).toLocaleDateString("fr-FR")} • {post.level}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuContent>
                <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
                <div className="space-y-1">
                  <DropdownMenuItem>
                    <Link className="w-full" href={`/creer-annonce?edit=${post.id}`}>
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      className="w-full text-left"
                      disabled={isPending}
                      onClick={() => startTransition(async () => { await closePost(post.id); })}
                      type="button"
                    >
                      Fermer
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <button
                      className="w-full text-left"
                      disabled={isPending}
                      onClick={() => startTransition(async () => { await deletePost(post.id); })}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{post.description}</p>
            <div className="flex flex-wrap gap-4">
              <span>Match: {new Date(post.matchDate).toLocaleDateString("fr-FR")} a {post.matchTime}</span>
              <span>Joueurs recherches: {post.slotsOpen}</span>
              <span>Candidatures recues: {post.applicationsCount}</span>
            </div>
            <Link href={`/annonces/${post.id}`}>
              <Button size="sm" variant="outline">Voir l&apos;annonce</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
