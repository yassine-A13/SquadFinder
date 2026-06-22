"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/shared/StarRating";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().or(z.literal("")),
});

type ReviewDialogProps = {
  postId: string;
  reviewedUserId: string;
  reviewedUserName: string;
};

export function ReviewDialog({ postId, reviewedUserId, reviewedUserName }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  async function onSubmit() {
    const parsed = reviewSchema.safeParse({ rating, comment });

    if (!parsed.success) {
      setStatus({ type: "error", message: "Veuillez fournir une note valide." });
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          reviewedUserId,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        setStatus({ type: "error", message: result.message ?? "Impossible d'enregistrer l'avis." });
        return;
      }

      setStatus({ type: "success", message: "Avis enregistre." });
      setOpen(false);
      setRating(5);
      setComment("");
    } catch {
      setStatus({ type: "error", message: "Erreur serveur lors de l'envoi." });
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Noter ce match
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Noter {reviewedUserName}</DialogTitle>
          <DialogDescription>
            Donnez une note et un commentaire pour ce match termine.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Note</p>
              <StarRating rating={rating} onChange={setRating} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Commentaire</label>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Partagez votre retour..."
                rows={4}
              />
            </div>
            {status.type === "error" ? (
              <p className="text-sm text-destructive">{status.message}</p>
            ) : null}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Annuler
          </Button>
          <Button onClick={onSubmit} type="button">
            Enregistrer
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
