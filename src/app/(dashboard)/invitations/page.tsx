import { getReceivedApplications } from "@/server/actions/applications";
import { ReceivedApplicationsBoard } from "@/components/shared/received-applications-board";

export default async function InvitationsPage() {
  const applications = await getReceivedApplications();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Candidatures recues</h2>
        <p className="text-sm text-muted-foreground">
          Acceptez ou refusez les candidatures recues sur vos annonces.
        </p>
      </div>
      <ReceivedApplicationsBoard initialApplications={applications} />
    </section>
  );
}
