import { api } from "./api";
import { Vehicle } from "./vehicle.api";
import { Driver } from "./driver.api";

export type TripStatus =
  | "draft"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Cargo {
  description?: string;
  weightKg?: number;
  unit?: "kg" | "ton" | "piece";
  quantity?: number;
}

export interface Trip {
  _id: string;
  tripNumber: string;
  status: TripStatus;
  vehicle: Vehicle | string;
  driver: Driver | string;
  origin: Location;
  destination: Location;
  distanceKm?: number;
  routeUrl?: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  scheduledArrival?: string;
  actualArrival?: string;
  cargo: Cargo;
  revenue: number;
  odometerStart?: number;
  odometerEnd?: number;
  cancellationReason?: string;
  notes?: string;
  createdBy: any;
  dispatchedBy?: any;
  completedBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetTripsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateTripPayload {
  vehicle: string;
  driver: string;
  origin: Location;
  destination: Location;
  scheduledDeparture: string;
  cargo?: Cargo;
}

export interface UpdateTripPayload extends Partial<CreateTripPayload> {
  notes?: string;
}

export interface DispatchTripPayload {
  odometerStart: number;
  actualDeparture: string;
}

export interface CompleteTripPayload {
  odometerEnd: number;
  actualArrival: string;
  revenue: number;
  notes?: string;
}

export interface CancelTripPayload {
  cancellationReason: string;
}

export interface TripListResponse {
  success: boolean;
  data: Trip[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TripResponse {
  success: boolean;
  data: Trip;
}

export const tripApi = {
  getTrips: async (params?: GetTripsParams) => {
    const { data } = await api.get<TripListResponse>("/trips", { params });
    return data;
  },

  getTripById: async (id: string) => {
    const { data } = await api.get<TripResponse>(`/trips/${id}`);
    return data;
  },

  createTrip: async (payload: CreateTripPayload) => {
    const { data } = await api.post<TripResponse>("/trips", payload);
    return data;
  },

  updateTrip: async (id: string, payload: UpdateTripPayload) => {
    const { data } = await api.put<TripResponse>(`/trips/${id}`, payload);
    return data;
  },

  dispatchTrip: async (id: string, payload: DispatchTripPayload) => {
    const { data } = await api.put<TripResponse>(`/trips/${id}/dispatch`, payload);
    return data;
  },

  completeTrip: async (id: string, payload: CompleteTripPayload) => {
    const { data } = await api.put<TripResponse>(`/trips/${id}/complete`, payload);
    return data;
  },

  cancelTrip: async (id: string, payload: CancelTripPayload) => {
    const { data } = await api.put<TripResponse>(`/trips/${id}/cancel`, payload);
    return data;
  },

  deleteTrip: async (id: string) => {
    const { data } = await api.delete(`/trips/${id}`);
    return data;
  },
};
