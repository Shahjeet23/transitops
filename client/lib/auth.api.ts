import { api } from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  },

  register: async (payload: RegisterPayload): Promise<{ user: User }> => {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get("/auth/me");
    return data.data;
  },

  updateProfile: async (payload: { name: string }): Promise<{ user: User }> => {
    const { data } = await api.put("/auth/profile", payload);
    return data.data;
  },

  changePassword: async (payload: any): Promise<void> => {
    await api.put("/auth/change-password", payload);
  },

  getUsers: async (params?: any) => {
    const { data } = await api.get("/auth/users", { params });
    return data;
  },

  toggleUserStatus: async (userId: string): Promise<{ user: User }> => {
    const { data } = await api.patch(`/auth/users/${userId}/status`);
    return data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<{ user: User }> => {
    const { data } = await api.patch(`/auth/users/${userId}/role`, { role });
    return data.data;
  },
};
