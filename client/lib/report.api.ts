import { api } from "./api";

export interface ReportDateParams {
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  revenue: number;
  costs: {
    total: number;
    breakdown: {
      expenses: number;
      fuel: number;
      maintenance: number;
    };
  };
  netProfit: number;
  profitMargin: number; // percentage
}

export interface FinancialSummaryResponse {
  success: boolean;
  data: FinancialSummary;
}

export interface VehicleROIRecord {
  vehicle: {
    id: string;
    plateNumber: string;
    name: string;
  };
  revenue: number;
  totalCosts: number;
  netProfit: number;
}

export interface VehicleROIResponse {
  success: boolean;
  data: VehicleROIRecord[];
}

export interface FuelEfficiencyRecord {
  vehicle: {
    id: string;
    plateNumber: string;
    name: string;
  };
  distance: number;
  totalLiters: number;
  fillUps: number;
  efficiency: number; // km/L
}

export interface FuelEfficiencyResponse {
  success: boolean;
  data: FuelEfficiencyRecord[];
}

export const reportApi = {
  getFinancialSummary: async (params?: ReportDateParams) => {
    const { data } = await api.get<FinancialSummaryResponse>("/reports/financial-summary", { params });
    return data;
  },

  getVehicleROI: async (params?: ReportDateParams) => {
    const { data } = await api.get<VehicleROIResponse>("/reports/vehicle-roi", { params });
    return data;
  },

  getFuelEfficiency: async (params?: ReportDateParams) => {
    const { data } = await api.get<FuelEfficiencyResponse>("/reports/fuel-efficiency", { params });
    return data;
  },
};
