"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  vehicleApi,
  GetVehiclesParams,
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "@/lib/vehicle.api";

export function useVehicles(params?: GetVehiclesParams) {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => vehicleApi.getVehicles(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicleApi.getVehicleById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehicleApi.createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) =>
      vehicleApi.updateVehicle(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleApi.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
