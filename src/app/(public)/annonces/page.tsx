import { AnnouncementsList } from "@/components/shared/announcements-list";

export default function AnnouncementsPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Annonces publiques</h2>
        <p className="text-sm text-muted-foreground">
          Exemple de listing branchable a Prisma une fois votre modele finalise.
        </p>
      </div>
      <AnnouncementsList />
    </section>
  );
}
