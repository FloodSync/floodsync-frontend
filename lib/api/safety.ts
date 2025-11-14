import { apiClient } from "./client";

export interface SafetyStatusRequest {
  userId: string;
  status: "safe" | "unsafe";
}

export interface SafetyStatusResponse {
  success: boolean;
  message: string;
}

export const safetyApi = {
  /**
   * Submit safety status to the backend
   * @param token - User's authentication token
   * @param userId - User's ID
   * @param isSafe - Whether the user is safe (true = "safe", false = "unsafe")
   */
  submitSafetyStatus: async (
    token: string,
    userId: string,
    isSafe: boolean
  ): Promise<SafetyStatusResponse> => {
    return apiClient.authenticatedRequest<SafetyStatusResponse>(
      "/safe",
      token,
      {
        method: "POST",
        body: JSON.stringify({
          userId,
          status: isSafe ? "safe" : "unsafe",
        }),
      }
    );
  },
};

