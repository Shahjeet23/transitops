"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryPoint } from "@/lib/dashboard.api";

interface Props {
  data: CategoryPoint[];
}

// Use CSS-variable-derived palette (oklch hues from the theme)
const COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-destructive)",
  "var(--color-muted-foreground)",
];

function formatLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExpenseCategoryChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground mb-1">Expense Breakdown</p>
      <p className="text-xs text-muted-foreground mb-4">By category (all time)</p>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No expense data yet
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 6).map((d, i) => {
              const pct = total > 0 ? Math.round((d.amount / total) * 100) : 0;
              return (
                <div key={d.category} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-foreground truncate">
                      {formatLabel(d.category)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
