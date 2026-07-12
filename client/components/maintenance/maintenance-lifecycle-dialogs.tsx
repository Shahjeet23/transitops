"use client";

import { useState } from "react";
import { MaintenanceDialog } from "./maintenance-dialog";
import type {
  MaintenanceLog,
  StartMaintenancePayload,
  CompleteMaintenancePayload,
  CancelMaintenancePayload,
  MaintenancePart,
} from "@/lib/maintenance.api";
import { Plus, Trash2 } from "lucide-react";

interface StartDialogProps {
  log: MaintenanceLog | null;
  onClose: () => void;
  onConfirm: (payload: StartMaintenancePayload) => void;
  isLoading: boolean;
}

export function StartMaintenanceDialog({ log, onClose, onConfirm, isLoading }: StartDialogProps) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [mileageAtServiceKm, setMileageAtServiceKm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      startDate: new Date(startDate).toISOString(),
      mileageAtServiceKm: mileageAtServiceKm ? Number(mileageAtServiceKm) : undefined,
    });
  };

  return (
    <MaintenanceDialog
      open={!!log}
      onOpenChange={(open) => !open && onClose()}
      title="Start Maintenance"
      description="Record the start of maintenance activities."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Start Date & Time <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Mileage at Service (km)
          </label>
          <input
            type="number"
            min="0"
            value={mileageAtServiceKm}
            onChange={(e) => setMileageAtServiceKm(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            {isLoading ? "Starting..." : "Start"}
          </button>
        </div>
      </form>
    </MaintenanceDialog>
  );
}

interface CompleteDialogProps {
  log: MaintenanceLog | null;
  onClose: () => void;
  onConfirm: (payload: CompleteMaintenancePayload) => void;
  isLoading: boolean;
}

export function CompleteMaintenanceDialog({ log, onClose, onConfirm, isLoading }: CompleteDialogProps) {
  const [completedDate, setCompletedDate] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [laborCost, setLaborCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [notes, setNotes] = useState("");
  
  // Parts state
  const [parts, setParts] = useState<MaintenancePart[]>([]);

  // Next service
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState("");

  const addPart = () => {
    setParts([...parts, { name: "", quantity: 1, unitCost: 0 }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof MaintenancePart, value: string | number) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      completedDate: new Date(completedDate).toISOString(),
      laborCost: laborCost ? Number(laborCost) : 0,
      otherCosts: otherCosts ? Number(otherCosts) : 0,
      notes: notes || undefined,
      parts: parts.length > 0 ? parts : undefined,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate).toISOString() : undefined,
      nextServiceKm: nextServiceKm ? Number(nextServiceKm) : undefined,
    });
  };

  return (
    <MaintenanceDialog
      open={!!log}
      onOpenChange={(open) => !open && onClose()}
      title="Complete Maintenance"
      description="Record costs and finalize the maintenance."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        
        {/* Parts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Parts Used</h4>
            <button
              type="button"
              onClick={addPart}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Part
            </button>
          </div>
          
          {parts.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No parts added.</p>
          )}

          {parts.map((part, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Part Name"
                  value={part.name}
                  onChange={(e) => updatePart(idx, "name", e.target.value)}
                  className="w-full rounded text-xs px-2 py-1.5 border border-input bg-background"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Qty"
                    value={part.quantity}
                    onChange={(e) => updatePart(idx, "quantity", Number(e.target.value))}
                    className="w-20 rounded text-xs px-2 py-1.5 border border-input bg-background"
                  />
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Unit Cost (₹)"
                    value={part.unitCost}
                    onChange={(e) => updatePart(idx, "unitCost", Number(e.target.value))}
                    className="flex-1 rounded text-xs px-2 py-1.5 border border-input bg-background"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePart(idx)}
                className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Labor Cost (₹)</label>
            <input
              type="number"
              min="0"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Other Costs (₹)</label>
            <input
              type="number"
              min="0"
              value={otherCosts}
              onChange={(e) => setOtherCosts(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Completed Date & Time <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="datetime-local"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="pt-2 border-t border-border mt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Next Service Reminder</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mileage (km)</label>
              <input
                type="number"
                min="0"
                value={nextServiceKm}
                onChange={(e) => setNextServiceKm(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Closing Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            {isLoading ? "Saving..." : "Complete"}
          </button>
        </div>
      </form>
    </MaintenanceDialog>
  );
}

interface CancelDialogProps {
  log: MaintenanceLog | null;
  onClose: () => void;
  onConfirm: (payload: CancelMaintenancePayload) => void;
  isLoading: boolean;
}

export function CancelMaintenanceDialog({ log, onClose, onConfirm, isLoading }: CancelDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ cancellationReason: reason });
  };

  return (
    <MaintenanceDialog
      open={!!log}
      onOpenChange={(open) => !open && onClose()}
      title="Cancel Maintenance"
      description="Provide a reason for cancelling this maintenance."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Why is this maintenance being cancelled?"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading || !reason}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </form>
    </MaintenanceDialog>
  );
}
