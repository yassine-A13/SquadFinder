"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { respondToApplication, type ApplicationListItem } from "@/server/actions/applications";
import { AlertDialog } from "@/components/ui/alert-dialog";
import AvatarRing from "@/components/shared/avatar-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ReceivedApplicationsBoardProps = {
  initialApplications: ApplicationListItem[];
};

type ConfirmationState =
  | {
      applicationId: string;
      status: "ACCEPTED" | "REJECTED";
    }
  | null;

async function fetchReceivedApplications() {
  const response = await fetch("/api/applications/received");

  if (!response.ok) {
    throw new Error("Impossible de charger les candidatures recues.");
  }

  return (await response.json()) as ApplicationListItem[];
}

export function ReceivedApplicationsBoard({
  initialApplications,
}: ReceivedApplicationsBoardProps) {
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
  const query = useQuery({
    queryKey: ["received-applications"],
    queryFn: fetchReceivedApplications,
    initialData: initialApplications,
  });

  const groupedApplications = useMemo(() => {
    return query.data.reduce<Record<string, { post: ApplicationListItem["post"]; items: ApplicationListItem[] }>>(
      (accumulator, application) => {
        if (!accumulator[application.post.id]) {
          accumulator[application.post.id] = {
            post: application.post,
            items: [],
          };
        }
        accumulator[application.post.id].items.push(application);
        return accumulator;
      },
      {},
    );
  }, [query.data]);

  const respondMutation = useMutation({
    mutationFn: async (payload: { applicationId: string; status: "ACCEPTED" | "REJECTED" }) =>
      respondToApplication(payload.applicationId, payload.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["received-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
      ]);
    },
  });

  if (!query.data.length) {
    return <p className="text-sm text-muted-foreground">Aucune candidature recue pour le moment.</p>;
  }

  return (
    <div className="space-y-6">
      {Object.values(groupedApplications).map(({ post, items }) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>
              {post.city} • {new Date(post.matchDate).toLocaleDateString("fr-FR")} a {post.matchTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((application) => (
              <div
                className="animate-sport-in flex flex-col gap-4 rounded-xl border border-border/80 p-4 md:flex-row md:items-center md:justify-between"
                key={application.id}
              >
                <div className="flex items-center gap-3">
                  <AvatarRing src={application.candidate.image ?? undefined} alt={application.candidate.name} size="lg" />
                  <div className="space-y-1">
                    <p className="font-medium">{application.candidate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.candidate.city ?? "Ville non renseignee"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Envoyee le {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={
                      application.status === "ACCEPTED"
                        ? "default"
                        : application.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {application.status}
                  </Badge>
                  {application.status === "PENDING" ? (
                    <>
                      <Button
                        disabled={respondMutation.isPending}
                        onClick={() =>
                          setConfirmation({
                            applicationId: application.id,
                            status: "ACCEPTED",
                          })
                        }
                        size="sm"
                        type="button"
                      >
                        Accepter
                      </Button>
                      <Button
                        disabled={respondMutation.isPending}
                        onClick={() =>
                          setConfirmation({
                            applicationId: application.id,
                            status: "REJECTED",
                          })
                        }
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        Refuser
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        actionLabel={confirmation?.status === "ACCEPTED" ? "Confirmer l'acceptation" : "Confirmer le refus"}
        actionVariant={confirmation?.status === "ACCEPTED" ? "default" : "destructive"}
        description={
          confirmation?.status === "ACCEPTED"
            ? "Cette action acceptera la candidature et ouvrira une conversation si necessaire."
            : "Cette action refusera la candidature. Elle pourra etre re-candidatee plus tard uniquement si vous adaptez le flux metier."
        }
        onConfirm={() => {
          if (!confirmation) {
            return;
          }

          respondMutation.mutate({
            applicationId: confirmation.applicationId,
            status: confirmation.status,
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
        open={Boolean(confirmation)}
        title={
          confirmation?.status === "ACCEPTED"
            ? "Accepter cette candidature ?"
            : "Refuser cette candidature ?"
        }
      />
    </div>
  );
}
