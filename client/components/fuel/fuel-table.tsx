"use client";

import { Edit, Trash2, Fuel } from "lucide-react";
import type { FuelLog } from "@/lib/fuel.api";
import type { Vehicle } from "@/lib/vehicle.api";
import { useAuthStore } from "@/store/auth.store";
import { hasPermission } from "@/lib/rbac";

interface Props {
  logs: FuelLog[];
  onEdit: (log: FuelLog) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function FuelTable({ logs, onEdit, onDelete, isLoading }: Props) {
  const user = useAuthStore(s => s.user);
  const canManage = hasPermission(user?.role, 'manage_fuel');

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading fuel logs...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Fuel className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-1">No fuel logs found</p>
        <p className="text-sm text-muted-foreground">
          Add a fuel entry to start tracking vehicle fuel efficiency and costs.
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fuel Info</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cost</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Odometer</th>
              {canManage && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>}
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
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {vehicle?.plateNumber || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle?.make} {vehicle?.model}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.date).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      {log.liters.toFixed(2)} L
                      {log.isFull && (
                        <span className="text-[10px] uppercase bg-primary/10 text-primary px-1 rounded-sm">Full</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {log.fuelType} @ ₹{log.pricePerLiter.toFixed(2)}/L
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                    ₹{log.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {log.odometerKm.toLocaleString()} km
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(log)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          title="Edit Log"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this fuel log?")) {
                              onDelete(log._id);
                            }
                          }}
                          className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
