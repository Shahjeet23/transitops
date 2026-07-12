"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from "@/lib/vehicle.api";
import { useEffect } from "react";

const VEHICLE_TYPES = ["truck", "van", "bus", "car", "motorcycle", "trailer"] as const;
const FUEL_TYPES = ["diesel", "petrol", "electric", "hybrid", "cng"] as const;
const STATUSES = ["available", "on_trip", "in_maintenance", "retired"] as const;

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(VEHICLE_TYPES),
  capacityKg: z.coerce.number().min(1, "Capacity must be at least 1 kg"),
  fuelType: z.enum(FUEL_TYPES),
  fuelCapacityLiters: z.coerce.number().min(0).optional().or(z.literal("")),
  currentOdometerKm: z.coerce.number().min(0),
  status: z.enum(STATUSES),
  vin: z.string().optional(),
  color: z.string().optional(),
  insuranceExpiry: z.string().optional().or(z.literal("")),
  registrationExpiry: z.string().optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;
type VehicleFormInput = z.input<typeof vehicleSchema>;

interface Props {
  initialData?: Vehicle;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  serverError: string | null;
}

export function VehicleForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormInput, any, VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      type: "truck",
      capacityKg: 1000,
      fuelType: "diesel",
      fuelCapacityLiters: "",
      currentOdometerKm: 0,
      status: "available",
      vin: "",
      color: "",
      insuranceExpiry: "",
      registrationExpiry: "",
      purchaseDate: "",
      purchasePrice: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        plateNumber: initialData.plateNumber,
        make: initialData.make,
        model: initialData.model,
        year: initialData.year,
        type: initialData.type as any,
        capacityKg: initialData.capacityKg,
        fuelType: initialData.fuelType as any,
        fuelCapacityLiters: initialData.fuelCapacityLiters ?? "",
        currentOdometerKm: initialData.currentOdometerKm,
        status: initialData.status as any,
        vin: initialData.vin ?? "",
        color: initialData.color ?? "",
        insuranceExpiry: initialData.insuranceExpiry
          ? new Date(initialData.insuranceExpiry).toISOString().split("T")[0]
          : "",
        registrationExpiry: initialData.registrationExpiry
          ? new Date(initialData.registrationExpiry).toISOString().split("T")[0]
          : "",
        purchaseDate: initialData.purchaseDate
          ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
          : "",
        purchasePrice: initialData.purchasePrice ?? "",
        notes: initialData.notes ?? "",
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: VehicleFormValues) => {
    const payload: any = { ...data };

    if (payload.fuelCapacityLiters === "") delete payload.fuelCapacityLiters;
    if (payload.purchasePrice === "") delete payload.purchasePrice;
    if (payload.insuranceExpiry === "") delete payload.insuranceExpiry;
    if (payload.registrationExpiry === "") delete payload.registrationExpiry;
    if (payload.purchaseDate === "") delete payload.purchaseDate;
    if (payload.vin === "") delete payload.vin;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Plate Number *</label>
          <input
            {...register("plateNumber")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            placeholder="MH12AB1234"
          />
          {errors.plateNumber && <p className="text-xs text-destructive">{errors.plateNumber.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">VIN</label>
          <input
            {...register("vin")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            placeholder="1HGCM82633A..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Make *</label>
          <input
            {...register("make")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tata"
          />
          {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Model *</label>
          <input
            {...register("model")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Prima"
          />
          {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Year *</label>
          <input
            type="number"
            {...register("year")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Type *</label>
          <select
            {...register("type")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring capitalize"
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Capacity & Fuel */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Capacity (kg) *</label>
          <input
            type="number"
            {...register("capacityKg")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.capacityKg && <p className="text-xs text-destructive">{errors.capacityKg.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fuel Type *</label>
          <select
            {...register("fuelType")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring capitalize"
          >
            {FUEL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fuel Capacity (Liters)</label>
          <input
            type="number"
            {...register("fuelCapacityLiters")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Current Odometer (km) *</label>
          <input
            type="number"
            {...register("currentOdometerKm")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Status *</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring capitalize"
          >
            {STATUSES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Color</label>
          <input
            {...register("color")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Compliance Dates */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Insurance Expiry</label>
          <input
            type="date"
            {...register("insuranceExpiry")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Registration Expiry</label>
          <input
            type="date"
            {...register("registrationExpiry")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 disabled:opacity-60 transition"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </div>
    </form>
  );
}
