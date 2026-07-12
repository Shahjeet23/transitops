"use client";

import { useState, useEffect } from "react";
import type { Expense, CreateExpensePayload, UpdateExpensePayload, ExpenseCategory, PaymentMethod } from "@/lib/expense.api";
import { useVehicles } from "@/hooks/use-vehicles";
import { useDrivers } from "@/hooks/use-drivers";

interface Props {
  initialData?: Expense;
  onSubmit: (data: CreateExpensePayload | UpdateExpensePayload) => void;
  isLoading: boolean;
  serverError?: string | null;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "toll", label: "Toll" },
  { value: "insurance", label: "Insurance" },
  { value: "registration", label: "Registration" },
  { value: "salary", label: "Salary" },
  { value: "tyre", label: "Tyre" },
  { value: "cleaning", label: "Cleaning" },
  { value: "parking", label: "Parking" },
  { value: "fine", label: "Fine" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
];

import { SearchableSelect } from "@/components/ui/searchable-select";

export function ExpenseForm({ initialData, onSubmit, isLoading, serverError }: Props) {
  const isEditing = !!initialData;
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10); // Use YYYY-MM-DD
  });
  const [description, setDescription] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  const { data: vehiclesData } = useVehicles();
  const { data: driversData } = useDrivers();

  useEffect(() => {
    if (initialData) {
      setVehicleId(typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle?._id || "");
      setDriverId(typeof initialData.driver === "string" ? initialData.driver : initialData.driver?._id || "");
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      
      if (initialData.date) {
        const d = new Date(initialData.date);
        const tzOffset = d.getTimezoneOffset() * 60000;
        setDate(new Date(d.getTime() - tzOffset).toISOString().slice(0, 10));
      }

      setDescription(initialData.description || "");
      setReceiptNumber(initialData.receiptNumber || "");
      setVendor(initialData.vendor || "");
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateExpensePayload = {
      category,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      description,
      paymentMethod,
    };

    if (vehicleId) payload.vehicle = vehicleId;
    if (driverId) payload.driver = driverId;
    if (receiptNumber) payload.receiptNumber = receiptNumber;
    if (vendor) payload.vendor = vendor;
    if (notes) payload.notes = notes;

    onSubmit(payload);
  };

  const vehicleOptions = [
    { label: "None", value: "" },
    ...(vehiclesData?.data?.map((v) => ({
      label: `${v.plateNumber} - ${v.make} ${v.model}`,
      value: v._id,
    })) || []),
  ];

  if (isEditing && initialData?.vehicle && vehicleId) {
    const vId = typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle._id;
    const vLabel = typeof initialData.vehicle === "string" ? initialData.vehicle : initialData.vehicle.plateNumber;
    if (!vehicleOptions.find(o => o.value === vId)) {
      vehicleOptions.push({ label: `${vLabel} (Current)`, value: vId });
    }
  }

  const driverOptions = [
    { label: "None", value: "" },
    ...(driversData?.data?.map((d) => ({
      label: d.name,
      value: d._id,
    })) || []),
  ];

  if (isEditing && initialData?.driver && driverId) {
    const dId = typeof initialData.driver === "string" ? initialData.driver : initialData.driver._id;
    const dLabel = typeof initialData.driver === "string" ? initialData.driver : initialData.driver.name;
    if (!driverOptions.find(o => o.value === dId)) {
      driverOptions.push({ label: `${dLabel} (Current)`, value: dId });
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
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description <span className="text-destructive">*</span>
          </label>
          <input
            id="description"
            required
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            placeholder="E.g., Monthly insurance premium"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-sm font-medium text-foreground">
            Amount (₹) <span className="text-destructive">*</span>
          </label>
          <input
            id="amount"
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Date <span className="text-destructive">*</span>
          </label>
          <input
            id="date"
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="paymentMethod" className="text-sm font-medium text-foreground">
            Payment Method <span className="text-destructive">*</span>
          </label>
          <select
            id="paymentMethod"
            required
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          >
            {PAYMENT_METHODS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="vehicle" className="text-sm font-medium text-foreground">
            Related Vehicle (Optional)
          </label>
          <SearchableSelect
            options={vehicleOptions}
            value={vehicleId}
            onChange={setVehicleId}
            placeholder="None"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="driver" className="text-sm font-medium text-foreground">
            Related Driver (Optional)
          </label>
          <SearchableSelect
            options={driverOptions}
            value={driverId}
            onChange={setDriverId}
            placeholder="None"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="vendor" className="text-sm font-medium text-foreground">
            Vendor Name (Optional)
          </label>
          <input
            id="vendor"
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="receiptNumber" className="text-sm font-medium text-foreground">
            Receipt Number (Optional)
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

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Submit Expense"}
        </button>
      </div>
    </form>
  );
}
