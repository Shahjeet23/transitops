"use client";

import { useState } from "react";
import type { Trip, DispatchTripPayload, CompleteTripPayload, CancelTripPayload } from "@/lib/trip.api";
import { TripDialog } from "./trip-dialog";

// --- Dispatch Dialog ---

interface DispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
  onSubmit: (payload: DispatchTripPayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function TripDispatchDialog({
  open,
  onOpenChange,
  trip,
  onSubmit,
  isLoading,
  serverError,
}: DispatchDialogProps) {
  const [odometerStart, setOdometerStart] = useState<number | "">("");
  const [actualDeparture, setActualDeparture] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      odometerStart: Number(odometerStart) || 0,
      actualDeparture: new Date(actualDeparture || new Date()).toISOString(),
    });
  };

  return (
    <TripDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Dispatch Trip"
      description={`Dispatching trip ${trip?.tripNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="odometerStart" className="text-sm font-medium text-foreground">
            Odometer Start (km) <span className="text-destructive">*</span>
          </label>
          <input
            id="odometerStart"
            required
            type="number"
            min="0"
            placeholder="e.g., 15000"
            value={odometerStart}
            onChange={(e) => setOdometerStart(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="actualDeparture" className="text-sm font-medium text-foreground">
            Actual Departure Time (Optional, defaults to now)
          </label>
          <input
            id="actualDeparture"
            type="datetime-local"
            value={actualDeparture}
            onChange={(e) => setActualDeparture(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Dispatching..." : "Dispatch"}
          </button>
        </div>
      </form>
    </TripDialog>
  );
}


// --- Complete Dialog ---

interface CompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
  onSubmit: (payload: CompleteTripPayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function TripCompleteDialog({
  open,
  onOpenChange,
  trip,
  onSubmit,
  isLoading,
  serverError,
}: CompleteDialogProps) {
  const [odometerEnd, setOdometerEnd] = useState<number | "">("");
  const [actualArrival, setActualArrival] = useState("");
  const [revenue, setRevenue] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      odometerEnd: Number(odometerEnd) || 0,
      actualArrival: new Date(actualArrival || new Date()).toISOString(),
      revenue: Number(revenue) || 0,
      notes,
    });
  };

  return (
    <TripDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Complete Trip"
      description={`Completing trip ${trip?.tripNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="odometerEnd" className="text-sm font-medium text-foreground">
              Odometer End (km) <span className="text-destructive">*</span>
            </label>
            <input
              id="odometerEnd"
              required
              type="number"
              min={trip?.odometerStart || 0}
              placeholder={`min ${trip?.odometerStart || 0}`}
              value={odometerEnd}
              onChange={(e) => setOdometerEnd(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="revenue" className="text-sm font-medium text-foreground">
              Revenue ($) <span className="text-destructive">*</span>
            </label>
            <input
              id="revenue"
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="actualArrival" className="text-sm font-medium text-foreground">
              Actual Arrival Time (Optional, defaults to now)
            </label>
            <input
              id="actualArrival"
              type="datetime-local"
              value={actualArrival}
              onChange={(e) => setActualArrival(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any issues or comments regarding the trip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            {isLoading ? "Completing..." : "Complete Trip"}
          </button>
        </div>
      </form>
    </TripDialog>
  );
}


// --- Cancel Dialog ---

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
  onSubmit: (payload: CancelTripPayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function TripCancelDialog({
  open,
  onOpenChange,
  trip,
  onSubmit,
  isLoading,
  serverError,
}: CancelDialogProps) {
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cancellationReason });
  };

  return (
    <TripDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Trip"
      description={`Are you sure you want to cancel trip ${trip?.tripNumber}?`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="reason" className="text-sm font-medium text-foreground">
            Cancellation Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            id="reason"
            required
            rows={3}
            placeholder="Why is this trip being cancelled?"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </form>
    </TripDialog>
  );
}
