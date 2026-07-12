"use client";

import { useState, useEffect } from "react";
import type { FuelLog, CreateFuelLogPayload, UpdateFuelLogPayload } from "@/lib/fuel.api";
import { useVehicles } from "@/hooks/use-vehicles";

interface Props {
  initialData?: FuelLog;
  onSubmit: (data: CreateFuelLogPayload | UpdateFuelLogPayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

import { SearchableSelect } from "@/components/ui/searchable-select";

export function FuelForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const isEditing = !!initialData;
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [fuelType, setFuelType] = useState("diesel");
  const [odometerKm, setOdometerKm] = useState("");
  const [isFull, setIsFull] = useState(true);
  const [stationName, setStationName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");

  const { data: vehiclesData } = useVehicles(); // Can be any status for fuel

  useEffect(() => {
    if (initialData) {
      setVehicleId(typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle?._id || "");
      
      if (initialData.date) {
        const d = new Date(initialData.date);
        const tzOffset = d.getTimezoneOffset() * 60000;
        setDate(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
      }

      setLiters(initialData.liters.toString());
      setPricePerLiter(initialData.pricePerLiter.toString());
      setFuelType(initialData.fuelType);
      setOdometerKm(initialData.odometerKm.toString());
      setIsFull(initialData.isFull);
      setStationName(initialData.stationName || "");
      setReceiptNumber(initialData.receiptNumber || "");
    }
  }, [initialData]);

  // Pre-fill odometer if a vehicle is selected and we're not editing
  useEffect(() => {
    if (!isEditing && vehicleId && vehiclesData?.data) {
      const selectedVehicle = vehiclesData.data.find(v => v._id === vehicleId);
      if (selectedVehicle && !odometerKm) {
        setOdometerKm(selectedVehicle.currentOdometerKm.toString());
      }
    }
  }, [vehicleId, isEditing, vehiclesData, odometerKm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      vehicle: vehicleId,
      date: new Date(date).toISOString(),
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      fuelType,
      odometerKm: Number(odometerKm),
      isFull,
      stationName,
      receiptNumber,
    };

    onSubmit(payload);
  };

  const calculatedTotal = (Number(liters) || 0) * (Number(pricePerLiter) || 0);

  const vehicleOptions = vehiclesData?.data?.map((v) => ({
    label: `${v.plateNumber} - ${v.make} ${v.model}`,
    value: v._id,
  })) || [];

  if (isEditing && initialData?.vehicle) {
    const vId = typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle._id;
    const vLabel = typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle.plateNumber;
    if (!vehicleOptions.find(o => o.value === vId)) {
      vehicleOptions.push({ label: `${vLabel} (Current)`, value: vId });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="vehicle" className="text-sm font-medium text-foreground">
            Vehicle <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            options={vehicleOptions}
            value={vehicleId}
            onChange={setVehicleId}
            placeholder="Select a vehicle"
            disabled={isLoading || isEditing}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Date & Time <span className="text-destructive">*</span>
          </label>
          <input
            id="date"
            required
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="odometerKm" className="text-sm font-medium text-foreground">
            Odometer (km) <span className="text-destructive">*</span>
          </label>
          <input
            id="odometerKm"
            required
            type="number"
            min="0"
            value={odometerKm}
            onChange={(e) => setOdometerKm(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="liters" className="text-sm font-medium text-foreground">
            Liters <span className="text-destructive">*</span>
          </label>
          <input
            id="liters"
            required
            type="number"
            min="0.1"
            step="0.01"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pricePerLiter" className="text-sm font-medium text-foreground">
            Price per Liter (₹) <span className="text-destructive">*</span>
          </label>
          <input
            id="pricePerLiter"
            required
            type="number"
            min="0"
            step="0.01"
            value={pricePerLiter}
            onChange={(e) => setPricePerLiter(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fuelType" className="text-sm font-medium text-foreground">
            Fuel Type <span className="text-destructive">*</span>
          </label>
          <select
            id="fuelType"
            required
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 capitalize"
          >
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric (kWh)</option>
          </select>
        </div>

        <div className="space-y-1.5 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition w-full h-[42px]">
            <input
              type="checkbox"
              checked={isFull}
              onChange={(e) => setIsFull(e.target.checked)}
              disabled={isLoading}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-sm font-medium text-foreground">Full Tank Fill-up</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stationName" className="text-sm font-medium text-foreground">
            Station Name
          </label>
          <input
            id="stationName"
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="receiptNumber" className="text-sm font-medium text-foreground">
            Receipt Number
          </label>
          <input
            id="receiptNumber"
            type="text"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Total Cost: </span>
          <span className="font-bold text-foreground text-lg">₹{calculatedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Fuel Log"}
        </button>
      </div>
    </form>
  );
}
