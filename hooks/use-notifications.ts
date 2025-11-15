import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { notificationHistoryApi } from "@/lib/api/notification-history";

export const useNotifications = (page: number, limit: number = 20) => {
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const lastNotificationIdRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);

  const {
    data: notificationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        throw new Error("Not authenticated");
      }
      try {
        const response = await notificationHistoryApi.getNotificationHistory(
          token,
          { page, limit }
        );
        console.log("useNotifications - response received:", {
          success: response.success,
          notificationsCount: response.notifications?.length || 0,
          pagination: response.pagination,
        });
        if (response.notifications && response.notifications.length > 0) {
          lastNotificationIdRef.current = response.notifications[0]._id;
        }
        return response;
      } catch (error: any) {
        console.error("useNotifications - error fetching:", error);
        throw error;
      }
    },
    enabled: isAuthenticated && !!token,
    retry: 2,
  });

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      if (!token || !isAuthenticated) return { success: true, unreadCount: 0 };
      return notificationHistoryApi.getUnreadCount(token);
    },
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000,
  });

  const pollForNewNotifications = useCallback(async () => {
    if (!token || !isAuthenticated || isPollingRef.current) return;

    isPollingRef.current = true;
    try {
      const response = await notificationHistoryApi.pollNotifications(
        token,
        25000,
        lastNotificationIdRef.current || undefined
      );

      if (response.hasNew && response.notifications.length > 0) {
        lastNotificationIdRef.current = response.notifications[0]._id;
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        });
      }
    } catch (error) {
      console.error("Error polling for notifications:", error);
    } finally {
      isPollingRef.current = false;
    }
  }, [token, isAuthenticated, queryClient]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    if (!isAuthenticated || !token) return;
    pollingIntervalRef.current = setInterval(() => {
      pollForNewNotifications();
    }, 30000);
  }, [isAuthenticated, token, pollForNewNotifications, stopPolling]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (isAuthenticated && token) {
          pollForNewNotifications();
          startPolling();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        stopPolling();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, [
    isAuthenticated,
    token,
    pollForNewNotifications,
    startPolling,
    stopPolling,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && token) {
        pollForNewNotifications();
        startPolling();
      }
      return () => {
        stopPolling();
      };
    }, [
      isAuthenticated,
      token,
      pollForNewNotifications,
      startPolling,
      stopPolling,
    ])
  );

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!token) throw new Error("Not authenticated");
      return notificationHistoryApi.markAsRead(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!token) throw new Error("Not authenticated");
      return notificationHistoryApi.deleteNotification(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return notificationHistoryApi.markAllAsRead(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Log the final data being returned
  useEffect(() => {
    if (notificationsData) {
      console.log("useNotifications - final notifications data:", {
        notificationsCount: notificationsData.notifications?.length || 0,
        hasPagination: !!notificationsData.pagination,
        unreadCount: unreadData?.unreadCount || 0,
      });
    }
  }, [notificationsData, unreadData]);

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadData?.unreadCount || 0,
    pagination: notificationsData?.pagination,
    isLoading,
    isError,
    isRefetching,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

export const getNotificationStyle = (type: string) => {
  switch (type) {
    case "flood_alert":
      return {
        icon: AlertTriangle,
        color: "#EF4444",
        bgColor: "bg-red-100",
      };
    case "test":
      return {
        icon: Info,
        color: "#3B82F6",
        bgColor: "bg-blue-100",
      };
    case "general":
      return {
        icon: Bell,
        color: "#6B7280",
        bgColor: "bg-gray-100",
      };
    case "system":
      return {
        icon: CheckCircle,
        color: "#10B981",
        bgColor: "bg-green-100",
      };
    default:
      return {
        icon: Info,
        color: "#3B82F6",
        bgColor: "bg-blue-100",
      };
  }
};
