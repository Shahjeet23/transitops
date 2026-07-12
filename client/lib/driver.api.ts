import { api } from "./api";

export interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  licenseNumber: string;
  licenseType: "A" | "B" | "C" | "D" | "E";
  licenseExpiry: string;
  joinDate?: string;
  experienceYears?: number;
  status: "available" | "on_trip" | "off_duty" | "suspended";
  isActive: boolean;
  currentVehicle?: string | any;
  currentTrip?: string | any;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  notes?: string;
  isLicenseExpired?: boolean;
  isLicenseExpiringSoon?: boolean;
  age?: number;
}

export interface GetDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetDriversResponse {
  data: Driver[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type CreateDriverPayload = Omit<
  Driver,
  | "_id"
  | "isActive"
  | "isLicenseExpired"
  | "isLicenseExpiringSoon"
  | "age"
  | "createdAt"
  | "updatedAt"
  | "currentVehicle"
  | "currentTrip"
>;

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

export const driverApi = {
  getDrivers: async (params?: GetDriversParams): Promise<GetDriversResponse> => {
    const { data } = await api.get("/drivers", { params });
    // Adjust depending on the backend response wrapper (assumes it returns { success, data: { data, meta } })
    return data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const { data } = await api.get(`/drivers/${id}`);
    return data.data;
  },

  createDriver: async (payload: CreateDriverPayload): Promise<Driver> => {
    const { data } = await api.post("/drivers", payload);
    return data.data;
  },

  updateDriver: async (id: string, payload: UpdateDriverPayload): Promise<Driver> => {
    const { data } = await api.put(`/drivers/${id}`, payload);
    return data.data;
  },

  deleteDriver: async (id: string): Promise<void> => {
    await api.delete(`/drivers/${id}`);
  },
};
