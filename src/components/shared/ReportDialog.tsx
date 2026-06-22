"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const reportSchema = z.object({
  reason: z.enum(["SPAM", "INAPPROPRIATE", "FAKE_PROFILE"]),
  description: z.string().max(500).optional().or(z.literal("")),
});

const reportOptions = [
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Comportement inapproprie" },
  { value: "FAKE_PROFILE", label: "Faux profil" },
] as const;

type ReportDialogProps = {
  reportedUserId: string;
};

export function ReportDialog({ reportedUserId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<{ status: "idle" | "success" | "error"; message?: string }>(
    { status: "idle" },
  );

  async function onSubmit() {
    const parsed = reportSchema.safeParse({ reason, description });

    if (!parsed.success) {
      setState({ status: "error", message: "Veuillez choisir une raison valide." });
      return;
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId,
          reason: parsed.data.reason,
          description: parsed.data.description,
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        setState({ status: "error", message: result.message ?? "Impossible de signaler ce joueur." });
        return;
      }

      setState({ status: "success", message: result.message });
      setOpen(false);
      setReason("SPAM");
      setDescription("");
    } catch {
      setState({ status: "error", message: "Erreur serveur lors de l'envoi du signalement." });
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Signaler
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Signaler ce joueur</DialogTitle>
          <DialogDescription>
            Choisissez une raison et partagez un detail si vous le souhaitez.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Raison</label>
              <Select value={reason} onValueChange={(value) => setReason(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez une raison" />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Description (optionnel)</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Dites-nous ce qui a motive votre signalement"
                rows={4}
              />
            </div>
            {state.status === "error" ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Annuler
          </Button>
          <Button onClick={onSubmit} type="button">
            Envoyer
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
