import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { authApi, LoginRequest, RegisterRequest } from "@/lib/api/auth";

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
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
  });
};
