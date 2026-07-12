import {
  AlertTriangle,
  Car,
  Clock,
  FileWarning,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { Alerts } from "@/lib/dashboard.api";

interface Props {
  alerts: Alerts;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface AlertRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  severity: "error" | "warning" | "info";
}

function AlertRow({ icon, title, subtitle, severity }: AlertRowProps) {
  const colours = {
    error:   "border-l-destructive bg-destructive/5 text-destructive",
    warning: "border-l-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    info:    "border-l-primary bg-primary/5 text-primary",
  }[severity];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${colours}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{title}</p>
        <p className="text-xs opacity-80 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts }: Props) {
  const rows: AlertRowProps[] = [];

  // License expired
  for (const d of alerts.licenseExpired) {
    rows.push({
      icon: <XCircle className="w-4 h-4" />,
      title: `License Expired — ${d.name}`,
      subtitle: `${d.licenseNumber} · Expired ${formatDate(d.licenseExpiry)}`,
      severity: "error",
    });
  }

  // License expiring
  for (const d of alerts.licenseExpiring) {
    rows.push({
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `License Expiring — ${d.name}`,
      subtitle: `${d.licenseNumber} · Expires ${formatDate(d.licenseExpiry)}`,
      severity: "warning",
    });
  }

  // Insurance expiring
  for (const v of alerts.insuranceExpiring) {
    rows.push({
      icon: <ShieldAlert className="w-4 h-4" />,
      title: `Insurance Expiring — ${v.plateNumber}`,
      subtitle: `${v.make} ${v.model} · Expires ${formatDate(v.insuranceExpiry!)}`,
      severity: "warning",
    });
  }

  // Registration expiring
  for (const v of alerts.registrationExpiring) {
    rows.push({
      icon: <FileWarning className="w-4 h-4" />,
      title: `Registration Expiring — ${v.plateNumber}`,
      subtitle: `${v.make} ${v.model} · Expires ${formatDate(v.registrationExpiry!)}`,
      severity: "warning",
    });
  }

  // Vehicles in maintenance
  for (const v of alerts.vehiclesInMaintenance) {
    rows.push({
      icon: <Car className="w-4 h-4" />,
      title: `In Maintenance — ${v.plateNumber}`,
      subtitle: `${v.make} ${v.model}`,
      severity: "info",
    });
  }

  // Pending expenses
  if (alerts.pendingExpensesCount > 0) {
    rows.push({
      icon: <Clock className="w-4 h-4" />,
      title: `${alerts.pendingExpensesCount} Expense${alerts.pendingExpensesCount > 1 ? "s" : ""} Pending Approval`,
      subtitle: "Review and approve or reject",
      severity: "info",
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">Alerts</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ShieldAlert className="w-8 h-8 opacity-30" />
          <p className="text-sm">No alerts — all clear!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <AlertRow key={i} {...r} />
          ))}
        </div>
      )}
    </div>
  );
}
