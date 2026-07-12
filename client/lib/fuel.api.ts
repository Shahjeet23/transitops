import { api } from "./api";
import type { Vehicle } from "./vehicle.api";
import type { Driver } from "./driver.api";

export interface FuelLog {
  _id: string;
  vehicle: Vehicle | string;
  driver?: Driver | string;
  trip?: any; // Trip reference if needed
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  fuelType: string;
  odometerKm: number;
  stationName?: string;
  stationLocation?: string;
  receiptNumber?: string;
  isFull: boolean;
  notes?: string;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetFuelLogsParams {
  page?: number;
  limit?: number;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateFuelLogPayload {
  vehicle: string;
  driver?: string;
  trip?: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  fuelType: string;
  odometerKm: number;
  stationName?: string;
  stationLocation?: string;
  receiptNumber?: string;
  isFull: boolean;
  notes?: string;
}

export interface UpdateFuelLogPayload extends Partial<CreateFuelLogPayload> {}

export interface FuelLogListResponse {
  success: boolean;
  data: FuelLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface FuelLogResponse {
  success: boolean;
  data: FuelLog;
}

export const fuelApi = {
  getFuelLogs: async (params?: GetFuelLogsParams) => {
    const { data } = await api.get<FuelLogListResponse>("/fuel", { params });
    return data;
  },

  getFuelLogById: async (id: string) => {
    const { data } = await api.get<FuelLogResponse>(`/fuel/${id}`);
    return data;
  },

  createFuelLog: async (payload: CreateFuelLogPayload) => {
    const { data } = await api.post<FuelLogResponse>("/fuel", payload);
    return data;
  },

  updateFuelLog: async (id: string, payload: UpdateFuelLogPayload) => {
    const { data } = await api.put<FuelLogResponse>(`/fuel/${id}`, payload);
    return data;
  },

  deleteFuelLog: async (id: string) => {
    const { data } = await api.delete(`/fuel/${id}`);
    return data;
  },
};
