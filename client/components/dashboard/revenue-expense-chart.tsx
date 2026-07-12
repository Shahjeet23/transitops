"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/dashboard.api";

interface Props {
  data: ChartPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatCurrency(val: number) {
  return `₹${val.toLocaleString("en-IN")}`;
}

export function RevenueExpenseChart({ data }: Props) {
  const displayData = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground mb-1">Revenue vs Expenses</p>
      <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No financial data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={displayData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                formatCurrency(Number(val) || 0),
                name === "revenue" ? "Revenue" : "Expenses",
              ]}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--color-foreground)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="var(--color-destructive)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              fillOpacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
