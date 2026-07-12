"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  driverApi,
  GetDriversParams,
  CreateDriverPayload,
  UpdateDriverPayload,
} from "@/lib/driver.api";

export function useDrivers(params?: GetDriversParams) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driverApi.getDrivers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: () => driverApi.getDriverById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driverApi.createDriver(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDriverPayload }) =>
      driverApi.updateDriver(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", id] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverApi.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
