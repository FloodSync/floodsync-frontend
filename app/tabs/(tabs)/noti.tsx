import React, { useState, useCallback } from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Card } from "@/components/ui/card";
import {
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Bell, XCircle, Trash2 } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { Notification } from "@/lib/api/notification-history";
import {
  useNotifications,
  formatTime,
  getNotificationStyle,
} from "@/hooks/use-notifications";

export default function NotiScreen() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isError,
    isRefetching,
    refetch,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications(page, limit);

  const handleDelete = useCallback(
    (notificationId: string) => {
      Alert.alert(
        "Delete Notification",
        "Are you sure you want to delete this notification?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteNotification(notificationId),
          },
        ]
      );
    },
    [deleteNotification]
  );

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead(notification._id);
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <Box className="flex-1">
        {/* Header */}
        <Box className="bg-blue-500 px-6 py-6 shadow-md">
          <HStack className="items-center justify-between">
            <VStack className="flex-1">
              <HStack className="items-center justify-between">
                <Heading className="text-white text-3xl font-bold">
                  Notifications
                </Heading>
                {unreadCount > 0 && (
                  <Box className="bg-red-500 rounded-full px-3 py-1">
                    <Text className="text-white text-sm font-bold">
                      {unreadCount}
                    </Text>
                  </Box>
                )}
              </HStack>
              <Text className="text-blue-100 text-base mt-1">
                Stay informed about flood alerts
              </Text>
            </VStack>
            <Bell size={28} color="#FFFFFF" />
          </HStack>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="mt-3 bg-blue-600 rounded-lg px-4 py-2 self-start"
            >
              <Text className="text-white text-sm font-semibold">
                {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
              </Text>
            </TouchableOpacity>
          )}
        </Box>

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-4">Loading notifications...</Text>
          </Box>
        ) : isError ? (
          <Box className="flex-1 items-center justify-center px-4">
            <XCircle size={64} color="#EF4444" />
            <Text className="text-gray-700 text-lg mt-4 font-semibold text-center">
              Failed to load notifications
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              {!isAuthenticated
                ? "Please log in to view notifications"
                : "Please try again later"}
            </Text>
            {isAuthenticated && (
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-4 bg-blue-500 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold">Retry</Text>
              </TouchableOpacity>
            )}
          </Box>
        ) : notifications.length === 0 ? (
          <Box className="flex-1 items-center justify-center py-12">
            <Bell size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4 font-semibold">
              No notifications
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              You're all caught up!
            </Text>
          </Box>
        ) : (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#3B82F6"
              />
            }
          >
            <Box className="px-4 py-6">
              <VStack space="md">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const IconComponent = style.icon;

                  return (
                    <TouchableOpacity
                      key={notification._id}
                      onPress={() => handleNotificationPress(notification)}
                      activeOpacity={0.7}
                    >
                      <Card
                        className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${
                          !notification.read ? "border-l-4" : "opacity-75"
                        }`}
                        style={{ borderLeftColor: style.color }}
                      >
                        <HStack space="md" className="items-start">
                          <Box
                            className={`${style.bgColor} rounded-full p-2`}
                            style={{ opacity: notification.read ? 0.6 : 1 }}
                          >
                            <IconComponent size={24} color={style.color} />
                          </Box>
                          <VStack className="flex-1">
                            <HStack className="items-start justify-between">
                              <VStack className="flex-1">
                                <Text
                                  className={`text-gray-900 font-semibold text-base ${
                                    !notification.read ? "" : "opacity-60"
                                  }`}
                                >
                                  {notification.title}
                                </Text>
                                <Text
                                  className={`text-gray-600 text-sm mt-1 ${
                                    !notification.read ? "" : "opacity-60"
                                  }`}
                                >
                                  {notification.body}
                                </Text>
                                {notification.data?.city &&
                                  notification.data?.township && (
                                    <Text className="text-gray-500 text-xs mt-1">
                                      {notification.data.city},{" "}
                                      {notification.data.township}
                                    </Text>
                                  )}
                                <Text className="text-blue-500 text-xs mt-2">
                                  {formatTime(
                                    notification.sentAt ||
                                      notification.createdAt
                                  )}
                                </Text>
                              </VStack>
                              <TouchableOpacity
                                onPress={() => handleDelete(notification._id)}
                                className="ml-2 p-2"
                                hitSlop={{
                                  top: 10,
                                  bottom: 10,
                                  left: 10,
                                  right: 10,
                                }}
                              >
                                <Trash2 size={18} color="#EF4444" />
                              </TouchableOpacity>
                            </HStack>
                            {!notification.read && (
                              <Box className="mt-2 self-start bg-blue-100 rounded-full px-2 py-1">
                                <Text className="text-blue-600 text-xs font-semibold">
                                  New
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </HStack>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </VStack>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <HStack className="items-center justify-center mt-6 space-x-4">
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg ${
                      page === 1 ? "bg-gray-200" : "bg-blue-500"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        page === 1 ? "text-gray-400" : "text-white"
                      }`}
                    >
                      Previous
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      page === pagination.totalPages
                        ? "bg-gray-200"
                        : "bg-blue-500"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        page === pagination.totalPages
                          ? "text-gray-400"
                          : "text-white"
                      }`}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </HStack>
              )}
            </Box>
          </ScrollView>
        )}
      </Box>
    </SafeAreaView>
  );
}
