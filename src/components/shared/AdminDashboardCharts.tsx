"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminDashboardChartsProps = {
  sports: Array<{ id: string; name: string; _count: { posts: number } }>;
  cities: Array<{ city: string; count: number }>;
  registrations: Array<{ month: string; registrations: number }>;
};

const colors = ["#2563EB", "#0F172A", "#22C55E", "#F59E0B", "#EF4444", "#7C3AED"];

export function AdminDashboardCharts({ sports, cities, registrations }: AdminDashboardChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
          <h3 className="mb-4 text-lg font-semibold">Sports populaires</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sports.map((sport) => ({ name: sport.name, value: sport._count.posts }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB">
                {sports.map((_, index) => (
                  <Cell key={_.id} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
          <h3 className="mb-4 text-lg font-semibold">Distribution par ville</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cities} dataKey="count" nameKey="city" innerRadius={60} outerRadius={100} paddingAngle={4}>
                {cities.map((_, index) => (
                  <Cell key={_.city} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
        <h3 className="mb-4 text-lg font-semibold">Inscriptions sur 12 mois</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={registrations}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="registrations" stroke="#22C55E" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
