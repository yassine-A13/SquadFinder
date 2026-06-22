import { revalidatePath } from "next/cache";

import { banUser, deleteUser, getAllUsers } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UsersPageProps = {
  searchParams?: { page?: string; search?: string };
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const page = Number(searchParams?.page ?? 1);
  const search = searchParams?.search;
  const data = await getAllUsers({ page, limit: 20, search });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Utilisateurs</h2>
        <p className="text-sm text-muted-foreground">Gestion des comptes et moderations.</p>
      </div>

      <div className="space-y-4">
        {data.users.map((user) => (
          <Card key={user.id} className="border-border/80">
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Role: {user.role}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("userId")?.toString() ?? "";
                    await banUser(id);
                    revalidatePath("/admin/users");
                  }}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="outline">Ban</Button>
                </form>
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("userId")?.toString() ?? "";
                    await deleteUser(id);
                    revalidatePath("/admin/users");
                  }}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="destructive">Supprimer</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
