"use client";

import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from "@/hooks/use-drivers";
import { DriverTable } from "@/components/drivers/driver-table";
import { DriverDialog } from "@/components/drivers/driver-dialog";
import { DriverForm } from "@/components/drivers/driver-form";
import type { Driver } from "@/lib/driver.api";

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useDrivers({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });

  const { mutate: createDriver, isPending: isCreating, error: createError } = useCreateDriver();
  const { mutate: updateDriver, isPending: isUpdating, error: updateError } = useUpdateDriver();
  const { mutate: deleteDriver } = useDeleteDriver();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();

  // Reset states when dialog closes
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingDriver(undefined);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDriver(id);
  };

  const handleSubmit = (payload: any) => {
    if (editingDriver) {
      updateDriver(
        { id: editingDriver._id, payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createDriver(payload, { onSuccess: () => setDialogOpen(false) });
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
          <h2 className="text-xl font-bold text-foreground">Drivers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your fleet drivers and their licenses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDriver(undefined);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or license..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48 shrink-0">
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
              <option value="off_duty">Off Duty</option>
              <option value="suspended">Suspended</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center text-destructive">
          <p className="font-medium">Failed to load drivers</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <DriverTable
            drivers={data?.data || []}
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

      <DriverDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        title={editingDriver ? "Edit Driver" : "Add Driver"}
        description={editingDriver ? `Updating details for ${editingDriver.name}` : "Enter details for the new driver"}
      >
        <DriverForm
          initialData={editingDriver}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
          serverError={serverError}
        />
      </DriverDialog>
    </div>
  );
}
