import { getMyFavorites } from "@/server/actions/favorites";
import { AnnouncementCard } from "@/components/shared/announcement-card";

export default async function FavoritesPage() {
  const favorites = await getMyFavorites();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Mes favoris</h2>
        <p className="text-sm text-muted-foreground">
          Retrouvez les annonces que vous avez ajoutees a vos favoris.
        </p>
      </div>

      {favorites.length === 0 ? (
        <p className="text-sm text-muted-foreground">Vous n&apos;avez encore aucune annonce favorisee.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => (
            <AnnouncementCard announcement={favorite} key={favorite.id} />
          ))}
        </div>
      )}
    </div>
  );
}
