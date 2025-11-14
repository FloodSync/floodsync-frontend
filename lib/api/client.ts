const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://investigations-regarding-rays-semi.trycloudflare.com/api/v1";

export interface ApiError {
  msg?: string;
  message?: string;
}

export const apiClient = {
  baseURL: API_BASE_URL,

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestBody = options.body;

    console.log("API Request:", {
      url,
      method: options.method || "GET",
      body: requestBody,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `Request failed with status ${response.status}`
        );
      }

      if (!response.ok) {
        const error: ApiError = data;
        const errorMessage =
          error.msg ||
          error.message ||
          JSON.stringify(data) ||
          `Request failed with status ${response.status}`;
        console.log("API Error Response:", data);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      if (
        error.message === "Network request failed" ||
        error.message === "Failed to fetch"
      ) {
        throw new Error(
          `Cannot connect to server. Make sure:\n` +
            `1. Backend is running on ${this.baseURL}\n` +
            `2. For mobile: Use your computer's IP (e.g., http://192.168.1.100:8000/api/v1)\n` +
            `3. Set EXPO_PUBLIC_API_URL in .env file`
        );
      }
      throw error;
    }
  },

  async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  },
};
