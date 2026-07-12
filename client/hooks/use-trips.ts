import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tripApi,
  GetTripsParams,
  CreateTripPayload,
  UpdateTripPayload,
  DispatchTripPayload,
  CompleteTripPayload,
  CancelTripPayload,
} from "@/lib/trip.api";

export function useTrips(params?: GetTripsParams) {
  return useQuery({
    queryKey: ["trips", params],
    queryFn: () => tripApi.getTrips(params),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => tripApi.getTripById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripApi.createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTripPayload;
    }) => tripApi.updateTrip(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
    },
  });
}

export function useDispatchTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: DispatchTripPayload;
    }) => tripApi.dispatchTrip(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CompleteTripPayload;
    }) => tripApi.completeTrip(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelTripPayload;
    }) => tripApi.cancelTrip(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tripApi.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
