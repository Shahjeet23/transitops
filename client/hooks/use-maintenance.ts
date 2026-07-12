import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  maintenanceApi,
  GetMaintenancesParams,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  StartMaintenancePayload,
  CompleteMaintenancePayload,
  CancelMaintenancePayload,
} from "@/lib/maintenance.api";

export function useMaintenances(params?: GetMaintenancesParams) {
  return useQuery({
    queryKey: ["maintenances", params],
    queryFn: () => maintenanceApi.getMaintenances(params),
  });
}

export function useMaintenance(id: string) {
  return useQuery({
    queryKey: ["maintenances", id],
    queryFn: () => maintenanceApi.getMaintenanceById(id),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) => maintenanceApi.createMaintenance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMaintenancePayload;
    }) => maintenanceApi.updateMaintenance(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
    },
  });
}

export function useStartMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: StartMaintenancePayload;
    }) => maintenanceApi.startMaintenance(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CompleteMaintenancePayload;
    }) => maintenanceApi.completeMaintenance(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useCancelMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelMaintenancePayload;
    }) => maintenanceApi.cancelMaintenance(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceApi.deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}
