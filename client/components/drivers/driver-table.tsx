"use client";

import { Edit, Trash2, AlertTriangle } from "lucide-react";
import type { Driver } from "@/lib/driver.api";

interface Props {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-500/10 text-green-600 dark:text-green-400",
  on_trip: "bg-primary/10 text-primary",
  off_duty: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  suspended: "bg-destructive/10 text-destructive",
};

export function DriverTable({ drivers, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <p className="text-foreground font-medium mb-1">No drivers found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters, or add a new driver.
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">License</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Exp. Yrs</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const showLicenseWarning = d.isLicenseExpired || d.isLicenseExpiringSoon;
              
              return (
                <tr
                  key={d._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{d.email}</div>
                    <div className="text-xs">{d.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-foreground uppercase font-mono text-xs">
                      {d.licenseNumber} (Type {d.licenseType})
                      {showLicenseWarning && (
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            d.isLicenseExpired ? "text-destructive" : "text-amber-500"
                          }`}
                          title={d.isLicenseExpired ? "License Expired" : "License Expiring Soon"}
                        />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Exp: {new Date(d.licenseExpiry).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {d.experienceYears || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[d.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(d)}
                        className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit Driver"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to retire driver ${d.name}?`)) {
                            onDelete(d._id);
                          }
                        }}
                        className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
