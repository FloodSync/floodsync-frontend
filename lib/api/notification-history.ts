import { apiClient } from "./client";

export interface NotificationData {
  city?: string;
  township?: string;
  floodRisk?: string | number;
  [key: string]: any;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: "flood_alert" | "test" | "general" | "system";
  data?: NotificationData;
  read: boolean;
  readAt: string | null;
  sent: boolean;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationHistoryResponse {
  success: boolean;
  notifications: Notification[];
  pagination: Pagination;
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  notification: Notification;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  updatedCount: number;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

export interface NotificationPollResponse {
  success: boolean;
  notifications: Notification[];
  hasNew: boolean;
  timeout?: boolean;
}

export interface NotificationHistoryParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: "flood_alert" | "test" | "general" | "system";
}

export const notificationHistoryApi = {
  getNotificationHistory: async (
    token: string,
    params?: NotificationHistoryParams
  ): Promise<NotificationHistoryResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.read !== undefined)
      queryParams.append("read", params.read.toString());
    if (params?.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;

    return apiClient.authenticatedRequest<NotificationHistoryResponse>(
      endpoint,
      token,
      {
        method: "GET",
      }
    );
  },

  getUnreadCount: async (token: string): Promise<UnreadCountResponse> => {
    return apiClient.authenticatedRequest<UnreadCountResponse>(
      "/notifications/unread-count",
      token,
      {
        method: "GET",
      }
    );
  },

  markAsRead: async (
    token: string,
    notificationId: string
  ): Promise<MarkReadResponse> => {
    return apiClient.authenticatedRequest<MarkReadResponse>(
      `/notifications/${notificationId}/read`,
      token,
      {
        method: "PATCH",
      }
    );
  },

  markAllAsRead: async (token: string): Promise<MarkAllReadResponse> => {
    return apiClient.authenticatedRequest<MarkAllReadResponse>(
      "/notifications/read-all",
      token,
      {
        method: "PATCH",
      }
    );
  },

  deleteNotification: async (
    token: string,
    notificationId: string
  ): Promise<DeleteNotificationResponse> => {
    return apiClient.authenticatedRequest<DeleteNotificationResponse>(
      `/notifications/${notificationId}`,
      token,
      {
        method: "DELETE",
      }
    );
  },

  pollNotifications: async (
    token: string,
    timeout?: number,
    lastNotificationId?: string
  ): Promise<NotificationPollResponse> => {
    const queryParams = new URLSearchParams();
    if (timeout) queryParams.append("timeout", timeout.toString());
    if (lastNotificationId)
      queryParams.append("lastNotificationId", lastNotificationId);

    const queryString = queryParams.toString();
    const endpoint = `/notifications/poll${
      queryString ? `?${queryString}` : ""
    }`;

    return apiClient.authenticatedRequest<NotificationPollResponse>(
      endpoint,
      token,
      {
        method: "GET",
      }
    );
  },
};
