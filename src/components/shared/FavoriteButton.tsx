"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

async function fetchFavoriteStatus(postId: string) {
  const response = await fetch(`/api/favorites?postId=${encodeURIComponent(postId)}`);

  if (!response.ok) {
    throw new Error("Impossible de charger l'etat des favoris.");
  }

  return (await response.json()) as { favorited: boolean };
}

async function toggleFavorite(postId: string) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) {
    throw new Error("Impossible de mettre a jour le favori.");
  }

  return (await response.json()) as { ok: boolean; message: string; data?: { favorited: boolean } };
}

type FavoriteButtonProps = {
  postId: string;
};

export function FavoriteButton({ postId }: FavoriteButtonProps) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["favorite", postId],
    queryFn: () => fetchFavoriteStatus(postId),
  });

  const mutation = useMutation({
    mutationFn: () => toggleFavorite(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["favorite", postId] });
      const previous = queryClient.getQueryData<{ favorited: boolean }>(["favorite", postId]);
      queryClient.setQueryData(["favorite", postId], {
        favorited: !previous?.favorited,
      });
      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", postId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const favorited = query.data?.favorited ?? false;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={() => mutation.mutate()}
      className={favorited ? "text-destructive" : "text-muted-foreground"}
    >
      <Heart className="size-5" fill={favorited ? "currentColor" : "none"} />
    </Button>
  );
}
