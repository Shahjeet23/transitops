"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MaintenanceTable } from "@/components/maintenance/maintenance-table";
import { MaintenanceDialog } from "@/components/maintenance/maintenance-dialog";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import {
  StartMaintenanceDialog,
  CompleteMaintenanceDialog,
  CancelMaintenanceDialog,
} from "@/components/maintenance/maintenance-lifecycle-dialogs";
import {
  useMaintenances,
  useCreateMaintenance,
  useUpdateMaintenance,
  useStartMaintenance,
  useCompleteMaintenance,
  useCancelMaintenance,
  useDeleteMaintenance,
} from "@/hooks/use-maintenance";
import type { MaintenanceLog, CreateMaintenancePayload, UpdateMaintenancePayload } from "@/lib/maintenance.api";

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: maintenances, isLoading } = useMaintenances({
    status: activeTab !== "all" ? activeTab : undefined,
  });

  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const deleteMutation = useDeleteMaintenance();
  const startMutation = useStartMaintenance();
  const completeMutation = useCompleteMaintenance();
  const cancelMutation = useCancelMaintenance();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  const [startingLog, setStartingLog] = useState<MaintenanceLog | null>(null);
  const [completingLog, setCompletingLog] = useState<MaintenanceLog | null>(null);
  const [cancellingLog, setCancellingLog] = useState<MaintenanceLog | null>(null);

  const handleFormSubmit = async (data: CreateMaintenancePayload | UpdateMaintenancePayload) => {
    try {
      if (editingLog) {
        await updateMutation.mutateAsync({ id: editingLog._id, payload: data as UpdateMaintenancePayload });
      } else {
        await createMutation.mutateAsync(data as CreateMaintenancePayload);
      }
      setIsFormOpen(false);
      setEditingLog(null);
    } catch (error) {
      console.error("Failed to save maintenance log", error);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Manage vehicle maintenance schedules, logs, and service history.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLog(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Schedule Maintenance
        </button>
      </div>

      <div className="flex space-x-1 rounded-xl bg-muted/50 p-1 w-full sm:w-fit overflow-x-auto">
        {["all", "scheduled", "in_progress", "completed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              }
            `}
          >
            {tab.replace("_", " ").charAt(0).toUpperCase() + tab.replace("_", " ").slice(1)}
          </button>
        ))}
      </div>

      <MaintenanceTable
        logs={maintenances?.data || []}
        isLoading={isLoading}
        onEdit={(log) => {
          setEditingLog(log);
          setIsFormOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        onStart={setStartingLog}
        onComplete={setCompletingLog}
        onCancel={setCancellingLog}
      />

      {/* Main Form Dialog (Create / Edit) */}
      <MaintenanceDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingLog(null);
        }}
        title={editingLog ? "Edit Maintenance" : "Schedule Maintenance"}
        description={editingLog ? "Update scheduled maintenance details." : "Create a new maintenance record."}
      >
        <MaintenanceForm
          initialData={editingLog || undefined}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          serverError={getServerError()}
        />
      </MaintenanceDialog>

      {/* Lifecycle Dialogs */}
      <StartMaintenanceDialog
        log={startingLog}
        onClose={() => setStartingLog(null)}
        isLoading={startMutation.isPending}
        onConfirm={async (payload) => {
          if (startingLog) {
            await startMutation.mutateAsync({ id: startingLog._id, payload });
            setStartingLog(null);
          }
        }}
      />

      <CompleteMaintenanceDialog
        log={completingLog}
        onClose={() => setCompletingLog(null)}
        isLoading={completeMutation.isPending}
        onConfirm={async (payload) => {
          if (completingLog) {
            await completeMutation.mutateAsync({ id: completingLog._id, payload });
            setCompletingLog(null);
          }
        }}
      />

      <CancelMaintenanceDialog
        log={cancellingLog}
        onClose={() => setCancellingLog(null)}
        isLoading={cancelMutation.isPending}
        onConfirm={async (payload) => {
          if (cancellingLog) {
            await cancelMutation.mutateAsync({ id: cancellingLog._id, payload });
            setCancellingLog(null);
          }
        }}
      />
    </div>
  );
}
