import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fuelApi,
  GetFuelLogsParams,
  CreateFuelLogPayload,
  UpdateFuelLogPayload,
} from "@/lib/fuel.api";

export function useFuelLogs(params?: GetFuelLogsParams) {
  return useQuery({
    queryKey: ["fuel-logs", params],
    queryFn: () => fuelApi.getFuelLogs(params),
  });
}

export function useFuelLog(id: string) {
  return useQuery({
    queryKey: ["fuel-logs", id],
    queryFn: () => fuelApi.getFuelLogById(id),
    enabled: !!id,
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFuelLogPayload) => fuelApi.createFuelLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel-logs"] });
      // Invalidate vehicles to reflect updated odometer reading
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFuelLogPayload;
    }) => fuelApi.updateFuelLog(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["fuel-logs"] });
      queryClient.invalidateQueries({ queryKey: ["fuel-logs", id] });
    },
  });
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fuelApi.deleteFuelLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel-logs"] });
    },
  });
}
