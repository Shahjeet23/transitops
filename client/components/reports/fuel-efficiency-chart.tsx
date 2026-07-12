"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FuelEfficiencyRecord } from "@/lib/report.api";

interface Props {
  data: FuelEfficiencyRecord[];
  isLoading: boolean;
}

export function FuelEfficiencyChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading fuel data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-[400px] flex items-center justify-center text-muted-foreground">
        No fuel efficiency data available for this period.
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((record) => ({
    name: record.vehicle.plateNumber,
    Efficiency: Number(record.efficiency.toFixed(2)),
    Distance: record.distance,
    Liters: record.totalLiters,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Fleet Fuel Efficiency</h3>
        <p className="text-sm text-muted-foreground">Average km/L per vehicle</p>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
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
              tickFormatter={(value) => `${value} km/L`}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-foreground)",
              }}
              itemStyle={{ color: "var(--color-foreground)" }}
              labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px" }}
              formatter={(value: any, name: any) => {
                if (name === "Efficiency") return [`${value} km/L`, "Efficiency"];
                if (name === "Distance") return [`${value} km`, "Distance"];
                if (name === "Liters") return [`${value} L`, "Fuel Consumed"];
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="Efficiency"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-card)", strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
