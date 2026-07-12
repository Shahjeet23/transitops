import type { RecentTrip } from "@/lib/dashboard.api";

interface Props {
  trips: RecentTrip[];
}

const STATUS_STYLES: Record<string, string> = {
  draft:       "bg-muted text-muted-foreground",
  dispatched:  "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed:   "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled:   "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function RecentTripsTable({ trips }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground mb-4">Recent Trips</p>

      {trips.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No trips yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Trip #", "Vehicle", "Driver", "Route", "Date", "Status", "Revenue"].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4 last:pr-0"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr
                  key={trip._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-foreground">
                    {trip.tripNumber}
                  </td>
                  <td className="py-3 pr-4 text-xs text-foreground">
                    {trip.vehicle
                      ? `${trip.vehicle.plateNumber}`
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-xs text-foreground">
                    {trip.driver?.name ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground max-w-[160px]">
                    <span className="truncate block">
                      {trip.origin.address} → {trip.destination.address}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(trip.scheduledDeparture)}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="py-3 text-xs text-foreground tabular-nums">
                    {trip.revenue > 0
                      ? `₹${trip.revenue.toLocaleString("en-IN")}`
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
