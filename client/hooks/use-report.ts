import { useQuery } from "@tanstack/react-query";
import { reportApi, ReportDateParams } from "@/lib/report.api";

export function useFinancialSummary(params?: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "financial-summary", params],
    queryFn: () => reportApi.getFinancialSummary(params),
  });
}

export function useVehicleROI(params?: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "vehicle-roi", params],
    queryFn: () => reportApi.getVehicleROI(params),
  });
}

export function useFuelEfficiency(params?: ReportDateParams) {
  return useQuery({
    queryKey: ["reports", "fuel-efficiency", params],
    queryFn: () => reportApi.getFuelEfficiency(params),
  });
}
