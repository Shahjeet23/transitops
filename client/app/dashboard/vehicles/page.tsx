"use client";

import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/hooks/use-vehicles";
import { VehicleTable } from "@/components/vehicles/vehicle-table";
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import type { Vehicle } from "@/lib/vehicle.api";
import { useAuthStore } from "@/store/auth.store";
import { hasPermission } from "@/lib/rbac";

export default function VehiclesPage() {
  const user = useAuthStore(s => s.user);
  const canManage = hasPermission(user?.role, 'manage_vehicles');
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useVehicles({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  const { mutate: createVehicle, isPending: isCreating, error: createError, isSuccess: isCreateSuccess } = useCreateVehicle();
  const { mutate: updateVehicle, isPending: isUpdating, error: updateError, isSuccess: isUpdateSuccess } = useUpdateVehicle();
  const { mutate: deleteVehicle } = useDeleteVehicle();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  // Reset states when dialog closes
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingVehicle(undefined);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteVehicle(id);
  };

  const handleSubmit = (payload: any) => {
    if (editingVehicle) {
      updateVehicle(
        { id: editingVehicle._id, payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createVehicle(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const serverError =
    (createError as any)?.response?.data?.message ||
    (updateError as any)?.response?.data?.message ||
    null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Vehicles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your fleet of vehicles
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingVehicle(undefined);
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by plate, make or model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-40 shrink-0">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition capitalize"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="in_maintenance">In Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-40 shrink-0">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition capitalize"
            >
              <option value="">All Types</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="trailer">Trailer</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center text-destructive">
          <p className="font-medium">Failed to load vehicles</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <VehicleTable
            vehicles={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
          
          {/* Pagination */}
          {data?.meta && data.meta.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-input bg-card text-sm font-medium text-foreground disabled:opacity-50 hover:bg-muted transition"
                >
                  Previous
                </button>
                <button
                  disabled={page === data.meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-input bg-card text-sm font-medium text-foreground disabled:opacity-50 hover:bg-muted transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <VehicleDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
        description={editingVehicle ? `Updating details for ${editingVehicle.plateNumber}` : "Enter details for the new vehicle"}
      >
        <VehicleForm
          initialData={editingVehicle}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
          serverError={serverError}
        />
      </VehicleDialog>
    </div>
  );
}
