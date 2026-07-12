"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { VehicleROIRecord } from "@/lib/report.api";

interface Props {
  data: VehicleROIRecord[];
  isLoading: boolean;
}

export function ROIChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading ROI data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-[400px] flex items-center justify-center text-muted-foreground">
        No ROI data available for this period.
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((record) => ({
    name: record.vehicle.plateNumber,
    Revenue: record.revenue,
    Costs: record.totalCosts,
    Profit: record.netProfit,
  }));

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Vehicle Return on Investment</h3>
        <p className="text-sm text-muted-foreground">Revenue vs Costs per vehicle</p>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-foreground)",
              }}
              itemStyle={{ color: "var(--color-foreground)" }}
              labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px" }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, undefined]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px", color: "var(--color-muted-foreground)" }}
              iconType="circle"
            />
            <Bar dataKey="Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="Costs" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
