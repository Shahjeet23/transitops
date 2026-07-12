import { api } from "@/lib/api";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (params?: any) => {
    const { data } = await api.get("/notifications", { params });
    return data;
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },
};
