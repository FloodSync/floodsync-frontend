import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { authApi, LoginRequest, RegisterRequest, User } from "@/lib/api/auth";
import { notificationService } from "@/lib/notifications/notification-service";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      queryClient.setQueryData(["user", response.token], response.user);
      router.replace("/tabs/(tabs)/home");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      queryClient.setQueryData(["user", response.token], response.user);
      router.replace("/tabs/(tabs)/home");
    },
    onError: (error: any) => {
      console.log("Registration error:", error);
      console.log("Error message:", error?.message);
      console.log("Error object:", JSON.stringify(error, null, 2));
    },
  });
};

export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["user", token],
    queryFn: () => {
      if (!token) throw new Error("No token");
      return authApi.getCurrentUser(token);
    },
    enabled: isAuthenticated && !!token,
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { token, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("No token");
      return authApi.logout(token);
    },
    onSuccess: async () => {
      if (token) {
        try {
          await notificationService.unregisterPushToken(token);
        } catch (error) {
          console.error("Failed to unregister push token on logout:", error);
        }
      }
      clearAuth();
      queryClient.clear();
      router.replace("/tabs/(tabs)/home");
    },
    onError: async () => {
      if (token) {
        try {
          await notificationService.unregisterPushToken(token);
        } catch (error) {
          console.error("Failed to unregister push token on logout:", error);
        }
      }
      clearAuth();
      queryClient.clear();
      router.replace("/tabs/(tabs)/home");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { user, token, setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (
      data: Partial<Omit<User, "_id" | "createdAt" | "updatedAt" | "friends">>
    ) => {
      if (!token || !user?._id) throw new Error("No token or user ID");
      return authApi.updateUser(token, user._id, data);
    },
    onSuccess: (response) => {
      if (token) {
        setAuth(response.user, token);
        queryClient.setQueryData(["user", token], response.user);
      }
    },
  });
};
