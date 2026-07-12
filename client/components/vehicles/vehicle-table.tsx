"use client";

import { Edit, Trash2 } from "lucide-react";
import type { Vehicle } from "@/lib/vehicle.api";

interface Props {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-500/10 text-green-600 dark:text-green-400",
  on_trip: "bg-primary/10 text-primary",
  in_maintenance: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  retired: "bg-muted text-muted-foreground",
};

export function VehicleTable({ vehicles, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <p className="text-foreground font-medium mb-1">No vehicles found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters, or add a new vehicle.
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plate Number</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Make / Model</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Capacity</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr
                key={v._id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3 font-mono font-medium text-foreground uppercase">
                  {v.plateNumber}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {v.make} {v.model}
                  <span className="text-muted-foreground ml-1">({v.year})</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">
                  {v.type}
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {v.capacityKg.toLocaleString()} kg
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[v.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {v.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(v)}
                      className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete vehicle ${v.plateNumber}?`)) {
                          onDelete(v._id);
                        }
                      }}
                      className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
