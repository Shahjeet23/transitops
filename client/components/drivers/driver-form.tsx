"use client";

import { useForm } from "react-hook-form";
import type { Driver, CreateDriverPayload } from "@/lib/driver.api";

interface Props {
  initialData?: Driver;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  serverError: string | null;
}

export function DriverForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDriverPayload>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone,
          licenseNumber: initialData.licenseNumber,
          licenseType: initialData.licenseType,
          licenseExpiry: initialData.licenseExpiry
            ? new Date(initialData.licenseExpiry).toISOString().split("T")[0]
            : "",
          dateOfBirth: initialData.dateOfBirth
            ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
            : "",
          joinDate: initialData.joinDate
            ? new Date(initialData.joinDate).toISOString().split("T")[0]
            : "",
          experienceYears: initialData.experienceYears,
          status: initialData.status,
          address: initialData.address || {},
          emergencyContact: initialData.emergencyContact || {},
          notes: initialData.notes,
        }
      : {
          status: "available",
          experienceYears: 0,
        },
  });

  const handleFormSubmit = (data: any) => {
    // Clean up empty objects
    if (!data.address?.street && !data.address?.city) data.address = undefined;
    if (!data.emergencyContact?.name) data.emergencyContact = undefined;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-2">
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone <span className="text-destructive">*</span></label>
            <input
              {...register("phone", { required: "Phone is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+1234567890"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Date of Birth</label>
            <input
              type="date"
              {...register("dateOfBirth", {
                validate: (value) => {
                  if (!value) return true;
                  const age = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                  return age >= 18 || "Driver must be at least 18 years old";
                }
              })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-2">
          License Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">License Number <span className="text-destructive">*</span></label>
            <input
              {...register("licenseNumber", { required: "License number is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
              placeholder="DL-123456"
            />
            {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">License Type <span className="text-destructive">*</span></label>
            <select
              {...register("licenseType", { required: "License type is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select type</option>
              <option value="A">Class A</option>
              <option value="B">Class B</option>
              <option value="C">Class C</option>
              <option value="D">Class D</option>
              <option value="E">Class E</option>
            </select>
            {errors.licenseType && <p className="text-xs text-destructive">{errors.licenseType.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">License Expiry <span className="text-destructive">*</span></label>
            <input
              type="date"
              {...register("licenseExpiry", { required: "License expiry is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.licenseExpiry && <p className="text-xs text-destructive">{errors.licenseExpiry.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-2">
          Employment & Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Experience (Years)</label>
            <input
              type="number"
              min="0"
              {...register("experienceYears", { valueAsNumber: true })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status <span className="text-destructive">*</span></label>
            <select
              {...register("status", { required: "Status is required" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring capitalize"
            >
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
              <option value="suspended">Suspended</option>
            </select>
            {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-2">
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              {...register("emergencyContact.name")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input
              {...register("emergencyContact.phone")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Relation</label>
            <input
              {...register("emergencyContact.relation")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Spouse"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData ? "Update Driver" : "Create Driver"}
        </button>
      </div>
    </form>
  );
}
