"use client";

import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import {
  useTrips,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useDispatchTrip,
  useCompleteTrip,
  useCancelTrip,
} from "@/hooks/use-trips";
import { TripTable } from "@/components/trips/trip-table";
import { TripDialog } from "@/components/trips/trip-dialog";
import { TripForm } from "@/components/trips/trip-form";
import {
  TripDispatchDialog,
  TripCompleteDialog,
  TripCancelDialog,
} from "@/components/trips/trip-lifecycle-dialogs";
import type { Trip } from "@/lib/trip.api";

export default function TripsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useTrips({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });

  const { mutate: createTrip, isPending: isCreating, error: createError } = useCreateTrip();
  const { mutate: updateTrip, isPending: isUpdating, error: updateError } = useUpdateTrip();
  const { mutate: deleteTrip } = useDeleteTrip();
  const { mutate: dispatchTrip, isPending: isDispatching, error: dispatchError } = useDispatchTrip();
  const { mutate: completeTrip, isPending: isCompleting, error: completeError } = useCompleteTrip();
  const { mutate: cancelTrip, isPending: isCancelling, error: cancelError } = useCancelTrip();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>();

  // Reset states when dialog closes
  const handleFormOpenChange = (open: boolean) => {
    setFormDialogOpen(open);
    if (!open) setActiveTrip(undefined);
  };

  const handleDispatchOpenChange = (open: boolean) => {
    setDispatchDialogOpen(open);
    if (!open) setActiveTrip(undefined);
  };

  const handleCompleteOpenChange = (open: boolean) => {
    setCompleteDialogOpen(open);
    if (!open) setActiveTrip(undefined);
  };

  const handleCancelOpenChange = (open: boolean) => {
    setCancelDialogOpen(open);
    if (!open) setActiveTrip(undefined);
  };

  // Actions
  const handleEdit = (trip: Trip) => {
    setActiveTrip(trip);
    setFormDialogOpen(true);
  };

  const handleDispatch = (trip: Trip) => {
    setActiveTrip(trip);
    setDispatchDialogOpen(true);
  };

  const handleComplete = (trip: Trip) => {
    setActiveTrip(trip);
    setCompleteDialogOpen(true);
  };

  const handleCancel = (trip: Trip) => {
    setActiveTrip(trip);
    setCancelDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTrip(id);
  };

  // Submits
  const handleFormSubmit = (payload: any) => {
    if (activeTrip) {
      updateTrip(
        { id: activeTrip._id, payload },
        { onSuccess: () => setFormDialogOpen(false) }
      );
    } else {
      createTrip(payload, { onSuccess: () => setFormDialogOpen(false) });
    }
  };

  const handleDispatchSubmit = (payload: any) => {
    if (activeTrip) {
      dispatchTrip(
        { id: activeTrip._id, payload },
        { onSuccess: () => setDispatchDialogOpen(false) }
      );
    }
  };

  const handleCompleteSubmit = (payload: any) => {
    if (activeTrip) {
      completeTrip(
        { id: activeTrip._id, payload },
        { onSuccess: () => setCompleteDialogOpen(false) }
      );
    }
  };

  const handleCancelSubmit = (payload: any) => {
    if (activeTrip) {
      cancelTrip(
        { id: activeTrip._id, payload },
        { onSuccess: () => setCancelDialogOpen(false) }
      );
    }
  };

  const formError =
    (createError as any)?.response?.data?.message ||
    (updateError as any)?.response?.data?.message ||
    null;
  const dispatchServerError = (dispatchError as any)?.response?.data?.message || null;
  const completeServerError = (completeError as any)?.response?.data?.message || null;
  const cancelServerError = (cancelError as any)?.response?.data?.message || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trips</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your fleet's trips and routes
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTrip(undefined);
            setFormDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Trip
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by trip number..."
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
              <option value="draft">Draft</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center text-destructive">
          <p className="font-medium">Failed to load trips</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <TripTable
            trips={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDispatch={handleDispatch}
            onComplete={handleComplete}
            onCancel={handleCancel}
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

      {/* Dialogs */}
      <TripDialog
        open={formDialogOpen}
        onOpenChange={handleFormOpenChange}
        title={activeTrip ? "Edit Draft Trip" : "Create Trip"}
        description={activeTrip ? `Updating trip ${activeTrip.tripNumber}` : "Enter details for the new trip"}
      >
        <TripForm
          initialData={activeTrip}
          onSubmit={handleFormSubmit}
          isLoading={isCreating || isUpdating}
          serverError={formError}
        />
      </TripDialog>

      <TripDispatchDialog
        open={dispatchDialogOpen}
        onOpenChange={handleDispatchOpenChange}
        trip={activeTrip}
        onSubmit={handleDispatchSubmit}
        isLoading={isDispatching}
        serverError={dispatchServerError}
      />

      <TripCompleteDialog
        open={completeDialogOpen}
        onOpenChange={handleCompleteOpenChange}
        trip={activeTrip}
        onSubmit={handleCompleteSubmit}
        isLoading={isCompleting}
        serverError={completeServerError}
      />

      <TripCancelDialog
        open={cancelDialogOpen}
        onOpenChange={handleCancelOpenChange}
        trip={activeTrip}
        onSubmit={handleCancelSubmit}
        isLoading={isCancelling}
        serverError={cancelServerError}
      />
    </div>
  );
}
