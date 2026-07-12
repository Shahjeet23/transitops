"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FuelTable } from "@/components/fuel/fuel-table";
import { FuelDialog } from "@/components/fuel/fuel-dialog";
import { FuelForm } from "@/components/fuel/fuel-form";
import {
  useFuelLogs,
  useCreateFuelLog,
  useUpdateFuelLog,
  useDeleteFuelLog,
} from "@/hooks/use-fuel";
import type { FuelLog, CreateFuelLogPayload, UpdateFuelLogPayload } from "@/lib/fuel.api";
import { useAuthStore } from "@/store/auth.store";
import { hasPermission } from "@/lib/rbac";

export default function FuelPage() {
  const user = useAuthStore(s => s.user);
  const canManage = hasPermission(user?.role, 'manage_fuel');
  const { data: fuelLogs, isLoading } = useFuelLogs();
  
  const createMutation = useCreateFuelLog();
  const updateMutation = useUpdateFuelLog();
  const deleteMutation = useDeleteFuelLog();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);

  const handleFormSubmit = async (data: CreateFuelLogPayload | UpdateFuelLogPayload) => {
    try {
      if (editingLog) {
        await updateMutation.mutateAsync({ id: editingLog._id, payload: data as UpdateFuelLogPayload });
      } else {
        await createMutation.mutateAsync(data as CreateFuelLogPayload);
      }
      setIsFormOpen(false);
      setEditingLog(null);
    } catch (error) {
      console.error("Failed to save fuel log", error);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fuel Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track fuel expenses, efficiency, and fill-ups across the fleet.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingLog(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Fuel Log
          </button>
        )}
      </div>

      <FuelTable
        logs={fuelLogs?.data || []}
        isLoading={isLoading}
        onEdit={(log) => {
          setEditingLog(log);
          setIsFormOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <FuelDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingLog(null);
        }}
        title={editingLog ? "Edit Fuel Log" : "Add Fuel Log"}
        description={editingLog ? "Update existing fuel record." : "Enter fuel purchase details."}
      >
        <FuelForm
          initialData={editingLog || undefined}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          serverError={getServerError()}
        />
      </FuelDialog>
    </div>
  );
}
