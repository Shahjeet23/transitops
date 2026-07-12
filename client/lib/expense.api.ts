import { api } from "./api";
import type { Vehicle } from "./vehicle.api";
import type { Driver } from "./driver.api";

export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "toll"
  | "insurance"
  | "registration"
  | "salary"
  | "tyre"
  | "cleaning"
  | "parking"
  | "fine"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "upi" | "cheque";

export interface Expense {
  _id: string;
  vehicle?: Vehicle | string;
  driver?: Driver | string;
  trip?: any;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string;
  vendor?: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  approvedBy?: any;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateExpensePayload {
  vehicle?: string;
  driver?: string;
  trip?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string;
  vendor?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateExpensePayload extends Partial<CreateExpensePayload> {}

export interface RejectExpensePayload {
  rejectionReason: string;
}

export interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense;
}

export const expenseApi = {
  getExpenses: async (params?: GetExpensesParams) => {
    const { data } = await api.get<ExpenseListResponse>("/expenses", { params });
    return data;
  },

  getExpenseById: async (id: string) => {
    const { data } = await api.get<ExpenseResponse>(`/expenses/${id}`);
    return data;
  },

  createExpense: async (payload: CreateExpensePayload) => {
    const { data } = await api.post<ExpenseResponse>("/expenses", payload);
    return data;
  },

  updateExpense: async (id: string, payload: UpdateExpensePayload) => {
    const { data } = await api.put<ExpenseResponse>(`/expenses/${id}`, payload);
    return data;
  },

  approveExpense: async (id: string) => {
    const { data } = await api.put<ExpenseResponse>(`/expenses/${id}/approve`);
    return data;
  },

  rejectExpense: async (id: string, payload: RejectExpensePayload) => {
    const { data } = await api.put<ExpenseResponse>(`/expenses/${id}/reject`, payload);
    return data;
  },

  deleteExpense: async (id: string) => {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  },
};
