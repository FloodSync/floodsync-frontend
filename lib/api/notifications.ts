import { apiClient } from "./client";

export interface PushTokenRequest {
  pushToken: string;
}

export interface PushTokenResponse {
  success: boolean;
  message: string;
}

export interface ToggleNotificationsRequest {
  enabled: boolean;
}

export const notificationsApi = {
  /**
   * Register or update the user's push notification token (authenticated)
   * @param token - User's authentication token
   * @param pushToken - Expo push token from the device
   */
  registerPushToken: async (
    token: string,
    pushToken: string
  ): Promise<PushTokenResponse> => {
    return apiClient.authenticatedRequest<PushTokenResponse>(
      "/user/push-token",
      token,
      {
        method: "POST",
        body: JSON.stringify({ pushToken }),
      }
    );
  },

  /**
   * Register push notification token without authentication
   * @param pushToken - Expo push token from the device
   */
  registerPushTokenUnauthenticated: async (
    pushToken: string
  ): Promise<PushTokenResponse> => {
    return apiClient.request<PushTokenResponse>("/device/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken }),
    });
  },

  /**
   * Remove the user's push notification token (e.g., on logout)
   * @param token - User's authentication token
   */
  removePushToken: async (token: string): Promise<PushTokenResponse> => {
    return apiClient.authenticatedRequest<PushTokenResponse>(
      "/user/push-token",
      token,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Toggle push notifications on/off for the user
   * @param token - User's authentication token
   * @param enabled - Whether to enable or disable notifications
   */
  togglePushNotifications: async (
    token: string,
    enabled: boolean
  ): Promise<PushTokenResponse> => {
    return apiClient.authenticatedRequest<PushTokenResponse>(
      "/user/push-notifications",
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }
    );
  },

  /**
   * Send a test push notification to the authenticated user
   * Endpoint 10: POST /api/v1/user/test/push
   * @param token - User's authentication token
   */
  testPushNotification: async (token: string): Promise<PushTokenResponse> => {
    return apiClient.authenticatedRequest<PushTokenResponse>(
      "/user/test/push",
      token,
      {
        method: "POST",
      }
    );
  },
};
