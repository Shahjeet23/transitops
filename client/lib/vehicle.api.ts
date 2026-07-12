import { api } from "./api";

export interface Vehicle {
  _id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: string;
  capacityKg: number;
  fuelType: string;
  fuelCapacityLiters?: number;
  currentOdometerKm: number;
  status: string;
  isActive: boolean;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  color?: string;
  vin?: string;
  notes?: string;
  isInsuranceExpiringSoon?: boolean;
  isRegistrationExpiringSoon?: boolean;
}

export interface GetVehiclesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface GetVehiclesResponse {
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type CreateVehiclePayload = Omit<
  Vehicle,
  | "_id"
  | "isActive"
  | "isInsuranceExpiringSoon"
  | "isRegistrationExpiringSoon"
  | "createdAt"
  | "updatedAt"
>;

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export const vehicleApi = {
  getVehicles: async (params?: GetVehiclesParams): Promise<GetVehiclesResponse> => {
    const { data } = await api.get("/vehicles", { params });
    return data.data;
  },

  getVehicleById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data.data;
  },

  createVehicle: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const { data } = await api.post("/vehicles", payload);
    return data.data;
  },

  updateVehicle: async (id: string, payload: UpdateVehiclePayload): Promise<Vehicle> => {
    const { data } = await api.put(`/vehicles/${id}`, payload);
    return data.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};
