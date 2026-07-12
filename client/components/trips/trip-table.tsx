"use client";

import { Edit, Trash2, Play, CheckCircle2, XCircle } from "lucide-react";
import type { Trip } from "@/lib/trip.api";
import type { Vehicle } from "@/lib/vehicle.api";
import type { Driver } from "@/lib/driver.api";

interface Props {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (id: string) => void;
  onDispatch: (trip: Trip) => void;
  onComplete: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  dispatched: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-destructive/10 text-destructive",
};

export function TripTable({
  trips,
  onEdit,
  onDelete,
  onDispatch,
  onComplete,
  onCancel,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <p className="text-foreground font-medium mb-1">No trips found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters, or create a new trip.
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trip No.</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle / Driver</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Route</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Schedule</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => {
              const vehicle = trip.vehicle as Vehicle;
              const driver = trip.driver as Driver;

              return (
                <tr
                  key={trip._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    {trip.tripNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">
                        {vehicle?.plateNumber || "Unknown Vehicle"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {driver?.name || "Unknown Driver"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-foreground truncate" title={trip.origin?.address}>
                        From: {trip.origin?.address}
                      </span>
                      <span className="text-foreground truncate" title={trip.destination?.address}>
                        To: {trip.destination?.address}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(trip.scheduledDeparture).toLocaleDateString()}
                    <br />
                    {new Date(trip.scheduledDeparture).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[trip.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {trip.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {trip.status === "draft" && (
                        <>
                          <button
                            onClick={() => onDispatch(trip)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                            title="Dispatch Trip"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(trip)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Edit Trip"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete trip ${trip.tripNumber}?`
                                )
                              ) {
                                onDelete(trip._id);
                              }
                            }}
                            className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete Trip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {(trip.status === "dispatched" || trip.status === "in_progress") && (
                        <button
                          onClick={() => onComplete(trip)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-green-500/10 hover:text-green-600 transition-colors"
                          title="Complete Trip"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {trip.status !== "completed" && trip.status !== "cancelled" && (
                        <button
                          onClick={() => onCancel(trip)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Cancel Trip"
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
