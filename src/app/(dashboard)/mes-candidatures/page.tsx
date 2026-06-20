import { getMyApplications } from "@/server/actions/applications";
import { MyApplicationsList } from "@/components/shared/my-applications-list";

export default async function MyApplicationsPage() {
  const applications = await getMyApplications();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes candidatures</h2>
        <p className="text-sm text-muted-foreground">
          Suivez ici les annonces auxquelles vous avez postule ainsi que leur statut.
        </p>
      </div>
      <MyApplicationsList applications={applications} />
    </section>
  );
}
