import { revalidatePath } from "next/cache";

import { getAllReports, resolveReport } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportsPageProps = {
  searchParams?: { page?: string; status?: string };
};

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const page = Number(searchParams?.page ?? 1);
  const status = searchParams?.status as "PENDING" | "RESOLVED" | "DISMISSED" | undefined;
  const data = await getAllReports({ page, limit: 20, status });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Signalements</h2>
        <p className="text-sm text-muted-foreground">Voir et traiter les signalements ouverts.</p>
      </div>

      <div className="space-y-4">
        {data.reports.map((report) => (
          <Card key={report.id} className="border-border/80">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{report.reportedUser.name}</CardTitle>
                <Badge variant={report.status === "PENDING" ? "destructive" : "secondary"}>
                  {report.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{report.reason}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Signalé par {report.reporter.name} ({report.reporter.email})</p>
              <div className="flex flex-wrap gap-2">
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("reportId")?.toString() ?? "";
                    await resolveReport(id, "DISMISS");
                    revalidatePath("/admin/reports");
                  }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <Button type="submit" variant="outline">Ignorer</Button>
                </form>
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("reportId")?.toString() ?? "";
                    await resolveReport(id, "RESOLVE");
                    revalidatePath("/admin/reports");
                  }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <Button type="submit">Avertir</Button>
                </form>
                <form action={async (formData: FormData) => {
                    "use server";
                    const id = formData.get("reportId")?.toString() ?? "";
                    await resolveReport(id, "BAN");
                    revalidatePath("/admin/reports");
                  }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <Button type="submit" variant="destructive">Bannir</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
