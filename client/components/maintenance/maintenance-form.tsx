"use client";

import { useState, useEffect } from "react";
import type { MaintenanceLog, CreateMaintenancePayload, UpdateMaintenancePayload, MaintenanceType } from "@/lib/maintenance.api";
import { useVehicles } from "@/hooks/use-vehicles";

interface Props {
  initialData?: MaintenanceLog;
  onSubmit: (data: CreateMaintenancePayload | UpdateMaintenancePayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function MaintenanceForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const isEditing = !!initialData;
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState<MaintenanceType>("preventive");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  
  // Service Provider
  const [spName, setSpName] = useState("");
  const [spContact, setSpContact] = useState("");
  const [spAddress, setSpAddress] = useState("");

  const { data: vehiclesData } = useVehicles({ status: isEditing ? undefined : "available" });

  useEffect(() => {
    if (initialData) {
      setVehicleId(typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle?._id || "");
      setType(initialData.type);
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      
      if (initialData.scheduledDate) {
        // Format to YYYY-MM-DDThh:mm
        const date = new Date(initialData.scheduledDate);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
        setScheduledDate(localISOTime.slice(0, 16));
      }

      if (initialData.serviceProvider) {
        setSpName(initialData.serviceProvider.name || "");
        setSpContact(initialData.serviceProvider.contact || "");
        setSpAddress(initialData.serviceProvider.address || "");
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      vehicle: vehicleId,
      type,
      title,
      description,
      scheduledDate: new Date(scheduledDate).toISOString(),
      serviceProvider: (spName || spContact || spAddress) ? {
        name: spName,
        contact: spContact,
        address: spAddress,
      } : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            required
            type="text"
            placeholder="e.g., Routine Oil Change & Brake Inspection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="vehicle" className="text-sm font-medium text-foreground">
            Vehicle <span className="text-destructive">*</span>
          </label>
          <select
            id="vehicle"
            required
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={isLoading || (isEditing && initialData.status !== "scheduled")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          >
            <option value="" disabled>Select a vehicle</option>
            {vehiclesData?.data?.map((v) => (
              <option key={v._id} value={v._id}>
                {v.plateNumber} - {v.make} {v.model}
              </option>
            ))}
            {isEditing && initialData.vehicle && !vehiclesData?.data?.find(v => v._id === (typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle._id)) && (
              <option value={typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle._id}>
                {typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle.plateNumber} (Current)
              </option>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Maintenance Type <span className="text-destructive">*</span>
          </label>
          <select
            id="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value as MaintenanceType)}
            disabled={isLoading || (isEditing && initialData.status !== "scheduled")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 capitalize"
          >
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="scheduledDate" className="text-sm font-medium text-foreground">
            Scheduled Date & Time <span className="text-destructive">*</span>
          </label>
          <input
            id="scheduledDate"
            required
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Details about what needs to be done..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-4">
        <p className="text-sm font-semibold text-foreground mb-3">Service Provider (Optional)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="spName" className="text-xs font-medium text-muted-foreground">
              Provider Name
            </label>
            <input
              id="spName"
              type="text"
              placeholder="e.g., QuickFix Auto Shop"
              value={spName}
              onChange={(e) => setSpName(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="spContact" className="text-xs font-medium text-muted-foreground">
              Contact Number
            </label>
            <input
              id="spContact"
              type="text"
              placeholder="e.g., +1 234 567 8900"
              value={spContact}
              onChange={(e) => setSpContact(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="spAddress" className="text-xs font-medium text-muted-foreground">
              Address
            </label>
            <input
              id="spAddress"
              type="text"
              placeholder="e.g., 123 Mechanic Lane"
              value={spAddress}
              onChange={(e) => setSpAddress(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Schedule Maintenance"}
        </button>
      </div>
    </form>
  );
}
