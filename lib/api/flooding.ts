import { apiClient } from "./client";

export interface FloodingItem {
  "medical kit": number;
  "food and water": number;
  shelter: number;
  clothing: number;
  "hygiene items": number;
  "baby care": number;
  "power and lighting": number;
  "safety and rescue gear": number;
}

export interface FloodingData {
  city: string;
  township: string;
  coords: [number, number];
  status: "High Risk" | "Moderate Risk";
  chance: number;
  locals: number;
  items: FloodingItem;
  safePercentage: number;
  unsafePercentage: number;
  noresponsePercentage: number;
}

export interface FloodingResponse {
  message: string;
  data: FloodingData[];
}

export const floodingApi = {
  getChancePercentageByCityTown: async (): Promise<FloodingResponse> => {
    return apiClient.request<FloodingResponse>(
      "/flooding/chance-percentage-by-city-town",
      {
        method: "GET",
      }
    );
  },
};

