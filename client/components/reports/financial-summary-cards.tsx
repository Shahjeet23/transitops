"use client";

import { TrendingUp, TrendingDown, DollarSign, Receipt, Wrench, Fuel } from "lucide-react";
import type { FinancialSummary } from "@/lib/report.api";

interface Props {
  data?: FinancialSummary;
  isLoading: boolean;
}

export function FinancialSummaryCards({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-10 w-10 bg-muted rounded-lg mb-4" />
            <div className="h-6 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { revenue, costs, netProfit, profitMargin } = data;
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ₹{revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Total Costs */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-destructive/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Costs</h3>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ₹{costs.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Net Profit</h3>
            <div className={`p-2 rounded-lg ${isProfitable ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {isProfitable ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ₹{Math.abs(netProfit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              {!isProfitable && <span className="text-sm text-red-500 ml-1">(Loss)</span>}
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Profit Margin</h3>
            <div className={`p-2 rounded-lg ${isProfitable ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {isProfitable ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {profitMargin.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fuel Costs</p>
            <p className="text-lg font-bold">₹{costs.breakdown.fuel.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Maintenance</p>
            <p className="text-lg font-bold">₹{costs.breakdown.maintenance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gen. Expenses</p>
            <p className="text-lg font-bold">₹{costs.breakdown.expenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
