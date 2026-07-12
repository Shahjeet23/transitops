import { api } from "./api";
import { Vehicle } from "./vehicle.api";

export type MaintenanceType = "preventive" | "corrective" | "emergency";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface MaintenancePart {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost?: number;
}

export interface MaintenanceLog {
  _id: string;
  vehicle: Vehicle | string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  diagnosis?: string;
  scheduledDate: string;
  startDate?: string;
  completedDate?: string;
  mileageAtServiceKm?: number;
  parts: MaintenancePart[];
  laborCost: number;
  otherCosts: number;
  totalCost?: number;
  partsCost?: number;
  serviceProvider?: {
    name?: string;
    contact?: string;
    address?: string;
  };
  nextServiceDate?: string;
  nextServiceKm?: number;
  notes?: string;
  createdBy: any;
  closedBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetMaintenancesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface CreateMaintenancePayload {
  vehicle: string;
  type: MaintenanceType;
  title: string;
  description?: string;
  scheduledDate: string;
  serviceProvider?: {
    name?: string;
    contact?: string;
    address?: string;
  };
}

export interface UpdateMaintenancePayload extends Partial<CreateMaintenancePayload> {
  notes?: string;
}

export interface StartMaintenancePayload {
  mileageAtServiceKm?: number;
  startDate?: string;
}

export interface CompleteMaintenancePayload {
  completedDate?: string;
  parts?: MaintenancePart[];
  laborCost?: number;
  otherCosts?: number;
  nextServiceDate?: string;
  nextServiceKm?: number;
  notes?: string;
}

export interface CancelMaintenancePayload {
  cancellationReason: string;
}

export interface MaintenanceListResponse {
  success: boolean;
  data: MaintenanceLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MaintenanceResponse {
  success: boolean;
  data: MaintenanceLog;
}

export const maintenanceApi = {
  getMaintenances: async (params?: GetMaintenancesParams) => {
    const { data } = await api.get<MaintenanceListResponse>("/maintenance", { params });
    return data;
  },

  getMaintenanceById: async (id: string) => {
    const { data } = await api.get<MaintenanceResponse>(`/maintenance/${id}`);
    return data;
  },

  createMaintenance: async (payload: CreateMaintenancePayload) => {
    const { data } = await api.post<MaintenanceResponse>("/maintenance", payload);
    return data;
  },

  updateMaintenance: async (id: string, payload: UpdateMaintenancePayload) => {
    const { data } = await api.put<MaintenanceResponse>(`/maintenance/${id}`, payload);
    return data;
  },

  startMaintenance: async (id: string, payload: StartMaintenancePayload) => {
    const { data } = await api.put<MaintenanceResponse>(`/maintenance/${id}/start`, payload);
    return data;
  },

  completeMaintenance: async (id: string, payload: CompleteMaintenancePayload) => {
    const { data } = await api.put<MaintenanceResponse>(`/maintenance/${id}/complete`, payload);
    return data;
  },

  cancelMaintenance: async (id: string, payload: CancelMaintenancePayload) => {
    const { data } = await api.put<MaintenanceResponse>(`/maintenance/${id}/cancel`, payload);
    return data;
  },

  deleteMaintenance: async (id: string) => {
    const { data } = await api.delete(`/maintenance/${id}`);
    return data;
  },
};
