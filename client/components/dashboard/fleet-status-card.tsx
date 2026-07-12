import type { StatusBreakdown } from "@/lib/dashboard.api";

interface Props {
  vehicles: StatusBreakdown;
  drivers: StatusBreakdown;
}

interface SegmentProps {
  label: string;
  count: number;
  total: number;
  colorClass: string;
  bgClass: string;
}

function Segment({ label, count, total, colorClass, bgClass }: SegmentProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground w-6 text-right tabular-nums">
          {count}
        </span>
      </div>
    </div>
  );
}

export function FleetStatusCard({ vehicles, drivers }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Vehicles */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Vehicles
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {vehicles.total} total
          </span>
        </p>
        <Segment label="Available"      count={vehicles.available}      total={vehicles.total} colorClass="bg-green-500"  bgClass="" />
        <Segment label="On Trip"        count={vehicles.on_trip}        total={vehicles.total} colorClass="bg-primary"    bgClass="" />
        <Segment label="In Maintenance" count={vehicles.in_maintenance ?? 0} total={vehicles.total} colorClass="bg-amber-500"  bgClass="" />
        <Segment label="Retired"        count={vehicles.retired ?? 0}   total={vehicles.total} colorClass="bg-muted-foreground" bgClass="" />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Drivers */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Drivers
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {drivers.total} total
          </span>
        </p>
        <Segment label="Available"  count={drivers.available}           total={drivers.total} colorClass="bg-green-500"       bgClass="" />
        <Segment label="On Trip"    count={drivers.on_trip}             total={drivers.total} colorClass="bg-primary"         bgClass="" />
        <Segment label="Off Duty"   count={drivers.off_duty ?? 0}       total={drivers.total} colorClass="bg-amber-500"       bgClass="" />
        <Segment label="Suspended"  count={drivers.suspended ?? 0}      total={drivers.total} colorClass="bg-destructive"     bgClass="" />
      </div>
    </div>
  );
}
