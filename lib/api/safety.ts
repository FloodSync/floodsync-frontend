import { apiClient } from "./client";

export interface SafeStatusRequest {
  userId: string;
  status: "safe" | "not_safe";
}

export interface SafeRecord {
  _id: string;
  status: string;
  city: string;
  township: string;
  userId: string;
  createdAt: string;
  __v: number;
}

export interface SafeStatusResponse {
  msg: string;
  safeRecord: SafeRecord;
}

export const safetyApi = {
  /**
   * Submit safety status (safe or not safe)
   * POST /api/v1/safe
   * @param token - User's authentication token
   * @param userId - User's ID
   * @param status - "safe" or "not_safe"
   */
  submitSafetyStatus: async (
    token: string,
    userId: string,
    status: "safe" | "not_safe"
  ): Promise<SafeStatusResponse> => {
    return apiClient.authenticatedRequest<SafeStatusResponse>("/safe", token, {
      method: "POST",
      body: JSON.stringify({
        userId,
        status,
      }),
    });
  },
};

