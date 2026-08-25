import api from '@/lib/axios';
import type { ApiResponse, Notification } from '@/types';

export const notificationService = {
  getAll: () =>
    api.get<ApiResponse<Notification[]>>('/notifications'),

  getUnreadCount: () =>
    api.get<ApiResponse<number>>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    api.put<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<ApiResponse<null>>('/notifications/read-all'),
};
