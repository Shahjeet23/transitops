"use client";

import {
  Activity,
  Car,
  DollarSign,
  Fuel,
  Loader2,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { KpiCard }               from "@/components/dashboard/kpi-card";
import { FleetStatusCard }       from "@/components/dashboard/fleet-status-card";
import { TripsChart }            from "@/components/dashboard/trips-chart";
import { RevenueExpenseChart }   from "@/components/dashboard/revenue-expense-chart";
import { ExpenseCategoryChart }  from "@/components/dashboard/expense-category-chart";
import { AlertsPanel }           from "@/components/dashboard/alerts-panel";
import { RecentTripsTable }      from "@/components/dashboard/recent-trips-table";

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonCard({ h = "h-28" }: { h?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card ${h} animate-pulse`} />
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonCard h="h-64" />
        <SkeletonCard h="h-64" />
        <SkeletonCard h="h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard h="h-56" />
        <SkeletonCard h="h-56" />
      </div>
      <SkeletonCard h="h-64" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();

  if (isLoading) return <LoadingState />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
        <p className="text-destructive font-medium">
          Failed to load dashboard
        </p>
        <p className="text-muted-foreground text-sm">
          {(error as any)?.response?.data?.message || "Unable to reach the server."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, vehicleStatusBreakdown, driverStatusBreakdown,
          tripsChart, revenueExpenseChart, expenseCategoryChart,
          alerts, recentTrips } = data;

  const totalAlerts =
    alerts.licenseExpired.length +
    alerts.licenseExpiring.length +
    alerts.insuranceExpiring.length +
    alerts.registrationExpiring.length +
    alerts.vehiclesInMaintenance.length +
    (alerts.pendingExpensesCount > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Operations Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time fleet snapshot
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${isFetching ? "animate-pulse" : ""}`} />
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Vehicles"
          value={kpis.totalVehicles}
          icon={Truck}
          variant="default"
        />
        <KpiCard
          label="Fleet Utilisation"
          value={kpis.fleetUtilization}
          icon={Activity}
          suffix="%"
          variant="primary"
        />
        <KpiCard
          label="Total Drivers"
          value={kpis.totalDrivers}
          icon={Users}
          variant="default"
        />
        <KpiCard
          label="Active Drivers"
          value={kpis.activeDrivers}
          icon={Users}
          variant="accent"
        />
        <KpiCard
          label="Active Trips"
          value={kpis.activeTrips}
          icon={Car}
          variant="primary"
        />
        <KpiCard
          label="Trips This Month"
          value={kpis.tripsThisMonth}
          icon={Car}
          variant="default"
        />
        <KpiCard
          label="Monthly Revenue"
          value={kpis.monthRevenue}
          icon={TrendingUp}
          prefix="₹"
          variant="accent"
        />
        <KpiCard
          label="Monthly Expenses"
          value={kpis.monthExpenses}
          icon={DollarSign}
          prefix="₹"
          variant={kpis.profit < 0 ? "destructive" : "default"}
        />
      </div>

      {/* ── Financial summary strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Profit</p>
            <p className={`text-lg font-bold tabular-nums ${kpis.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              ₹{kpis.profit.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Fuel className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Fuel Cost</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              ₹{kpis.monthFuelCost.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-500/10">
            <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {kpis.pendingExpenses}
            </p>
          </div>
        </div>
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TripsChart data={tripsChart} />
        </div>
        <FleetStatusCard
          vehicles={vehicleStatusBreakdown}
          drivers={driverStatusBreakdown}
        />
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueExpenseChart data={revenueExpenseChart} />
        <ExpenseCategoryChart data={expenseCategoryChart} />
      </div>

      {/* ── Bottom row: alerts + recent trips ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <AlertsPanel alerts={alerts} />
        </div>
        <div className="lg:col-span-2">
          <RecentTripsTable trips={recentTrips} />
        </div>
      </div>
    </div>
  );
}
