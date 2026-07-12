"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Expense } from "@/lib/expense.api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}

export function ExpenseStatusDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
  isLoading,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!mounted) return null;
  if (!open || !expense) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground">
            Reject Expense
          </h2>
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this expense.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(reason);
          }}
          className="space-y-4 py-2"
        >
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="e.g. Missing valid receipt"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-50"
            >
              {isLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4 text-foreground" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}
