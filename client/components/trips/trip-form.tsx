"use client";

import { useState, useEffect } from "react";
import type { Trip, CreateTripPayload, UpdateTripPayload } from "@/lib/trip.api";
import { useVehicles } from "@/hooks/use-vehicles";
import { useDrivers } from "@/hooks/use-drivers";

interface Props {
  initialData?: Trip;
  onSubmit: (data: CreateTripPayload | UpdateTripPayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export function TripForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const isEditing = !!initialData;
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [cargoWeightKg, setCargoWeightKg] = useState<number | "">("");

  // Only load available vehicles/drivers when creating
  const { data: vehiclesData } = useVehicles({ status: isEditing ? undefined : "available" });
  const { data: driversData } = useDrivers({ status: isEditing ? undefined : "available" });

  useEffect(() => {
    if (initialData) {
      setVehicleId(typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle?._id || "");
      setDriverId(typeof initialData.driver === "string" ? initialData.driver : initialData.driver?._id || "");
      setOriginAddress(initialData.origin?.address || "");
      setDestinationAddress(initialData.destination?.address || "");
      if (initialData.scheduledDeparture) {
        // Format to YYYY-MM-DDThh:mm for datetime-local input
        const date = new Date(initialData.scheduledDeparture);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
        setScheduledDeparture(localISOTime.slice(0, 16));
      }
      setCargoDescription(initialData.cargo?.description || "");
      setCargoWeightKg(initialData.cargo?.weightKg || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      vehicle: vehicleId,
      driver: driverId,
      origin: { address: originAddress },
      destination: { address: destinationAddress },
      scheduledDeparture: new Date(scheduledDeparture).toISOString(),
      cargo: {
        description: cargoDescription,
        weightKg: cargoWeightKg ? Number(cargoWeightKg) : 0,
      },
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
        <div className="space-y-1.5">
          <label htmlFor="vehicle" className="text-sm font-medium text-foreground">
            Vehicle <span className="text-destructive">*</span>
          </label>
          <select
            id="vehicle"
            required
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={isLoading || (isEditing && initialData.status !== "draft")}
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
          <label htmlFor="driver" className="text-sm font-medium text-foreground">
            Driver <span className="text-destructive">*</span>
          </label>
          <select
            id="driver"
            required
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            disabled={isLoading || (isEditing && initialData.status !== "draft")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          >
            <option value="" disabled>Select a driver</option>
            {driversData?.data?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
            {isEditing && initialData.driver && !driversData?.data?.find(d => d._id === (typeof initialData.driver === "string" ? initialData.driver : initialData.driver._id)) && (
              <option value={typeof initialData.driver === "string" ? initialData.driver : initialData.driver._id}>
                {typeof initialData.driver === "string" ? initialData.driver : initialData.driver.name} (Current)
              </option>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="originAddress" className="text-sm font-medium text-foreground">
            Origin Address <span className="text-destructive">*</span>
          </label>
          <input
            id="originAddress"
            required
            type="text"
            placeholder="E.g., 123 Logistics Park, City"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="destinationAddress" className="text-sm font-medium text-foreground">
            Destination Address <span className="text-destructive">*</span>
          </label>
          <input
            id="destinationAddress"
            required
            type="text"
            placeholder="E.g., 456 Delivery Hub, City"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="scheduledDeparture" className="text-sm font-medium text-foreground">
            Scheduled Departure <span className="text-destructive">*</span>
          </label>
          <input
            id="scheduledDeparture"
            required
            type="datetime-local"
            value={scheduledDeparture}
            onChange={(e) => setScheduledDeparture(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cargoDescription" className="text-sm font-medium text-foreground">
            Cargo Description
          </label>
          <input
            id="cargoDescription"
            type="text"
            placeholder="E.g., Electronics, Pallets"
            value={cargoDescription}
            onChange={(e) => setCargoDescription(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cargoWeightKg" className="text-sm font-medium text-foreground">
            Cargo Weight (kg)
          </label>
          <input
            id="cargoWeightKg"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={cargoWeightKg}
            onChange={(e) => setCargoWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Trip"}
        </button>
      </div>
    </form>
  );
}
