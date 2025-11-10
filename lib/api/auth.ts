import { apiClient } from "./client";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  township: string;
  friends: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  township: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log("register data", data);
    return apiClient.request<AuthResponse>("/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.request<AuthResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async (token: string): Promise<User> => {
    return apiClient.authenticatedRequest<User>("/user/me", token, {
      method: "GET",
    });
  },

  logout: async (token: string): Promise<{ message: string }> => {
    return apiClient.authenticatedRequest<{ message: string }>(
      "/user/logout",
      token,
      {
        method: "POST",
      }
    );
  },
};
