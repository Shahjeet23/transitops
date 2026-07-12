"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseStatusDialog } from "@/components/expenses/expense-status-dialog";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
} from "@/hooks/use-expense";
import type { Expense, CreateExpensePayload, UpdateExpensePayload } from "@/lib/expense.api";
import { useAuthStore } from "@/store/auth.store";
import { hasPermission } from "@/lib/rbac";

export default function ExpensesPage() {
  const user = useAuthStore(s => s.user);
  const canManage = hasPermission(user?.role, 'manage_expenses');
  const { data: expensesList, isLoading } = useExpenses();
  
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);

  const handleFormSubmit = async (data: CreateExpensePayload | UpdateExpensePayload) => {
    try {
      if (editingExpense) {
        await updateMutation.mutateAsync({ id: editingExpense._id, payload: data as UpdateExpensePayload });
      } else {
        await createMutation.mutateAsync(data as CreateExpensePayload);
      }
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Failed to save expense", error);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!rejectingExpense) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectingExpense._id, payload: { rejectionReason: reason } });
      setIsRejectOpen(false);
      setRejectingExpense(null);
    } catch (error) {
      console.error("Failed to reject expense", error);
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this expense?")) {
      try {
        await approveMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to approve expense", error);
      }
    }
  };

  const getServerError = () => {
    const error = createMutation.error || updateMutation.error;
    if (!error) return null;
    return (error as any).response?.data?.message || "An unexpected error occurred.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Manage operational costs and approval workflows.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        )}
      </div>

      <ExpenseTable
        expenses={expensesList?.data || []}
        isLoading={isLoading}
        onEdit={(expense) => {
          setEditingExpense(expense);
          setIsFormOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        onApprove={handleApprove}
        onReject={(expense) => {
          setRejectingExpense(expense);
          setIsRejectOpen(true);
        }}
      />

      <ExpenseDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingExpense(null);
        }}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
        description={editingExpense ? "Modify a pending expense." : "Submit a new expense for approval."}
      >
        <ExpenseForm
          initialData={editingExpense || undefined}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          serverError={getServerError()}
        />
      </ExpenseDialog>

      <ExpenseStatusDialog
        open={isRejectOpen}
        onOpenChange={(open) => {
          setIsRejectOpen(open);
          if (!open) setRejectingExpense(null);
        }}
        expense={rejectingExpense}
        onSubmit={handleRejectSubmit}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
