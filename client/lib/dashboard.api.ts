import { api } from "@/lib/api";

export interface DashboardKpis {
  totalVehicles: number;
  fleetUtilization: number;
  totalDrivers: number;
  activeDrivers: number;
  activeTrips: number;
  tripsToday: number;
  tripsThisMonth: number;
  tripsCompleted: number;
  monthRevenue: number;
  monthExpenses: number;
  monthFuelCost: number;
  profit: number;
  pendingExpenses: number;
}

export interface StatusBreakdown {
  total: number;
  available: number;
  on_trip: number;
  in_maintenance?: number;
  retired?: number;
  off_duty?: number;
  suspended?: number;
}

export interface ChartPoint {
  date: string;
  count?: number;
  revenue?: number;
  expenses?: number;
  cost?: number;
  liters?: number;
}

export interface CategoryPoint {
  category: string;
  amount: number;
}

export interface AlertDriver {
  _id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export interface AlertVehicle {
  _id: string;
  plateNumber: string;
  make: string;
  model: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
}

export interface Alerts {
  licenseExpired: AlertDriver[];
  licenseExpiring: AlertDriver[];
  insuranceExpiring: AlertVehicle[];
  registrationExpiring: AlertVehicle[];
  vehiclesInMaintenance: AlertVehicle[];
  pendingExpensesCount: number;
}

export interface RecentTrip {
  _id: string;
  tripNumber: string;
  status: string;
  vehicle: { plateNumber: string; make: string; model: string } | null;
  driver: { name: string } | null;
  origin: { address: string };
  destination: { address: string };
  scheduledDeparture: string;
  revenue: number;
}

export interface RecentExpense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  vehicle: { plateNumber: string; make: string; model: string } | null;
}

export interface DashboardData {
  kpis: DashboardKpis;
  vehicleStatusBreakdown: StatusBreakdown;
  driverStatusBreakdown: StatusBreakdown;
  tripsChart: ChartPoint[];
  revenueExpenseChart: ChartPoint[];
  fuelChart: ChartPoint[];
  expenseCategoryChart: CategoryPoint[];
  alerts: Alerts;
  recentTrips: RecentTrip[];
  recentExpenses: RecentExpense[];
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardData> => {
    const { data } = await api.get("/dashboard/summary");
    return data.data;
  },
};
