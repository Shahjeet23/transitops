"use client";

import { Edit, Trash2, Wrench, CheckCircle2, XCircle } from "lucide-react";
import type { MaintenanceLog } from "@/lib/maintenance.api";
import type { Vehicle } from "@/lib/vehicle.api";

interface Props {
  logs: MaintenanceLog[];
  onEdit: (log: MaintenanceLog) => void;
  onDelete: (id: string) => void;
  onStart: (log: MaintenanceLog) => void;
  onComplete: (log: MaintenanceLog) => void;
  onCancel: (log: MaintenanceLog) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-destructive/10 text-destructive",
};

export function MaintenanceTable({
  logs,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading maintenance logs...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <p className="text-foreground font-medium mb-1">No maintenance records found</p>
        <p className="text-sm text-muted-foreground">
          Schedule maintenance or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Schedule</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cost</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const vehicle = log.vehicle as Vehicle;

              return (
                <tr
                  key={log._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate" title={log.title}>
                    {log.title}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {vehicle?.plateNumber || "Unknown Vehicle"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {log.type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.scheduledDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {log.totalCost ? `₹${log.totalCost.toLocaleString("en-IN")}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[log.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {log.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {log.status === "scheduled" && (
                        <>
                          <button
                            onClick={() => onStart(log)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                            title="Start Maintenance"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(log)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete maintenance record: ${log.title}?`)) {
                                onDelete(log._id);
                              }
                            }}
                            className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {log.status === "in_progress" && (
                        <button
                          onClick={() => onComplete(log)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-green-500/10 hover:text-green-600 transition-colors"
                          title="Complete Maintenance"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {log.status !== "completed" && log.status !== "cancelled" && (
                        <button
                          onClick={() => onCancel(log)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Cancel Maintenance"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
