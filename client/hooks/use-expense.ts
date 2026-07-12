import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  expenseApi,
  GetExpensesParams,
  CreateExpensePayload,
  UpdateExpensePayload,
  RejectExpensePayload,
} from "@/lib/expense.api";

export function useExpenses(params?: GetExpensesParams) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expenseApi.getExpenses(params),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => expenseApi.getExpenseById(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expenseApi.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpensePayload;
    }) => expenseApi.updateExpense(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.approveExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RejectExpensePayload;
    }) => expenseApi.rejectExpense(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
