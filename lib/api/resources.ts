import { apiClient } from "./client";

export type ResourceType = string; // Dynamic based on API response

export interface SupplyCategory {
  _id?: string;
  category: string;
  __v?: number;
}

export interface SupplyCategoryResponse {
  status: number;
  message: string;
  data: SupplyCategory[];
}

export interface SupplySurveyRequest {
  userId: string;
  city: string;
  township: string;
  supplyList: string[];
}

export interface SupplySurveyResponse {
  status?: number;
  success?: boolean;
  message?: string;
}

export const resourcesApi = {
  /**
   * Get available supply categories from the backend
   * GET /api/v1/supply-category
   * Response: { status: 200, message: "...", data: [{ category: "..." }, ...] }
   */
  getSupplyCategories: async (): Promise<SupplyCategory[]> => {
    const response = await apiClient.request<SupplyCategoryResponse>("/supply-category", {
      method: "GET",
    });
    // Extract the data array from the response
    return response.data || [];
  },

  /**
   * Submit supply survey to the backend
   * POST /api/v1/supply-survey
   * @param token - User's authentication token
   * @param userId - User's ID
   * @param city - User's city
   * @param township - User's township
   * @param supplyList - Array of supply categories the user needs
   */
  submitSupplySurvey: async (
    token: string,
    userId: string,
    city: string,
    township: string,
    supplyList: string[]
  ): Promise<SupplySurveyResponse> => {
    return apiClient.authenticatedRequest<SupplySurveyResponse>(
      "/supply-survey",
      token,
      {
        method: "POST",
        body: JSON.stringify({
          userId,
          city,
          township,
          supplyList,
        }),
      }
    );
  },
};

