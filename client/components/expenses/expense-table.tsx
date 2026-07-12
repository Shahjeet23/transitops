"use client";

import { Edit, Trash2, CheckCircle2, XCircle, Receipt } from "lucide-react";
import type { Expense } from "@/lib/expense.api";
import type { Vehicle } from "@/lib/vehicle.api";
import type { Driver } from "@/lib/driver.api";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (expense: Expense) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-green-500/10 text-green-600 dark:text-green-400",
  rejected: "bg-destructive/10 text-destructive",
};

export function ExpenseTable({ expenses, onEdit, onDelete, onApprove, onReject, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Receipt className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-1">No expenses found</p>
        <p className="text-sm text-muted-foreground">
          Add an expense to start tracking operations costs.
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const vehicle = expense.vehicle as Vehicle | undefined;
              const driver = expense.driver as Driver | undefined;

              return (
                <tr
                  key={expense._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground max-w-[200px] truncate" title={expense.description}>
                      {expense.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle?.plateNumber ? `Vehicle: ${vehicle.plateNumber}` : ""}
                      {vehicle?.plateNumber && driver?.name ? " | " : ""}
                      {driver?.name ? `Driver: ${driver.name}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{expense.category}</span>
                    <div className="text-xs text-muted-foreground capitalize">
                      {expense.paymentMethod.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                    ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[expense.status] || "bg-muted text-muted-foreground"
                      }`}
                      title={expense.status === "rejected" ? expense.rejectionReason : undefined}
                    >
                      {expense.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {expense.status === "pending" && (
                        <>
                          <button
                            onClick={() => onApprove(expense._id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-green-500/10 hover:text-green-600 transition-colors"
                            title="Approve Expense"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject(expense)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Reject Expense"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(expense)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Edit Expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {expense.status !== "approved" && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this expense?")) {
                              onDelete(expense._id);
                            }
                          }}
                          className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
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
