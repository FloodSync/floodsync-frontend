import React, { useState, useCallback } from "react";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Search,
  X,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendsApi, Friend, FriendRequest } from "@/lib/api/friends";

export default function FriendsScreen() {
  const { t } = useLanguage();
  const { token, isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    // Format Myanmar phone numbers (959XXXXXXXXX)
    if (cleaned.startsWith("959") && cleaned.length === 11) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
  };

  // Fetch friends
  const {
    data: friendsData,
    isLoading: isLoadingFriends,
    refetch: refetchFriends,
    isRefetching: isRefetchingFriends,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: () => friendsApi.getFriends(token!),
    enabled: isAuthenticated && !!token,
    retry: 2,
  });

  // Fetch friend requests
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => friendsApi.getFriendRequests(token!),
    enabled: isAuthenticated && !!token,
    retry: 2,
  });

  const friends = friendsData?.friends || [];
  const requests = requestsData?.requests || [];

  // Search users
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !token) return;

    setIsSearching(true);
    try {
      const response = await friendsApi.searchUsers(token, searchTerm.trim());
      setSearchResults(response.users || []);
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Error", error.message || "Failed to search users");
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, token]);

  // Send friend request
  const sendRequestMutation = useMutation({
    mutationFn: (friendId: string) =>
      friendsApi.sendFriendRequest(token!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      Alert.alert("Success", t("requestSent"));
      setSearchTerm("");
      setSearchResults([]);
      setShowSearch(false);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.message || t("requestAlreadySent") || "Failed to send request"
      );
    },
  });

  // Accept request
  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      friendsApi.acceptFriendRequest(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      Alert.alert("Success", t("requestAccepted"));
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to accept request");
    },
  });

  // Reject request
  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      friendsApi.rejectFriendRequest(token!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      Alert.alert("Success", t("requestRejected"));
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to reject request");
    },
  });

  // Remove friend
  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) => friendsApi.removeFriend(token!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      Alert.alert("Success", t("friendRemoved"));
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to remove friend");
    },
  });

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      t("removeFriend"),
      t("removeFriendConfirm"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: t("removeFriend"),
          style: "destructive",
          onPress: () => removeFriendMutation.mutate(friend._id),
        },
      ]
    );
  };

  const getStatusIcon = (isSafe?: boolean) => {
    if (isSafe === true) return CheckCircle;
    if (isSafe === false) return XCircle;
    return AlertCircle;
  };

  const getStatusColor = (isSafe?: boolean) => {
    if (isSafe === true) return "#10B981";
    if (isSafe === false) return "#EF4444";
    return "#9CA3AF";
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <Box className="flex-1 items-center justify-center px-4">
          <Users size={64} color="#9CA3AF" />
          <Text className="text-gray-700 text-lg mt-4 font-semibold text-center">
            Please log in to view friends
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      {/* Back Button Header */}
      <Box className="flex-row items-center px-4 py-3 bg-blue-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
          <Text className="text-blue-600 font-semibold ml-2 text-base">
            Back
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Header */}
      <Box className="bg-blue-500 px-6 py-6 shadow-md">
        <HStack className="items-center justify-between">
          <VStack className="flex-1">
            <Heading className="text-white text-3xl font-bold">
              {t("friendsAndFamily")}
            </Heading>
            <Text className="text-blue-100 text-base mt-1">
              {t("myFriends")} ({friends.length})
            </Text>
          </VStack>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            className="bg-blue-600 rounded-full p-3"
          >
            {showSearch ? (
              <X size={24} color="#FFFFFF" />
            ) : (
              <UserPlus size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* Search Section */}
      {showSearch && (
        <Box className="bg-white px-4 py-4 border-b border-gray-200">
          <HStack className="items-center space-x-2">
            <Box className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-800"
                placeholder={t("searchByPhone")}
                value={searchTerm}
                onChangeText={(text) => {
                  // Only allow digits, +, and spaces
                  const cleaned = text.replace(/[^\d+\s]/g, "");
                  setSearchTerm(cleaned);
                }}
                onSubmitEditing={handleSearch}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </Box>
            <TouchableOpacity
              onPress={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="bg-blue-500 rounded-lg px-4 py-2"
              style={{ opacity: isSearching || !searchTerm.trim() ? 0.5 : 1 }}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">
                  {t("searchUsers")}
                </Text>
              )}
            </TouchableOpacity>
          </HStack>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box className="mt-4">
              <Text className="text-gray-600 text-sm mb-2">
                {t("searchUsers")}
              </Text>
              <VStack space="sm">
                {searchResults.map((user) => {
                  const isAlreadyFriend = friends.some(
                    (f) => f._id === user._id
                  );
                  const hasPendingRequest = requests.some(
                    (r) =>
                      (r.from._id === user._id || r.to._id === user._id) &&
                      r.status === "pending"
                  );

                  return (
                    <Card
                      key={user._id}
                      className="bg-white rounded-xl p-4 border border-gray-200"
                    >
                      <HStack className="items-center justify-between">
                        <VStack className="flex-1">
                          <Text className="text-gray-900 font-semibold text-base">
                            {user.name}
                          </Text>
                          <HStack className="items-center mt-1">
                            <Text className="text-blue-600 font-medium text-sm">
                              {formatPhoneNumber(user.phone)}
                            </Text>
                          </HStack>
                          <HStack className="items-center mt-1">
                            <MapPin size={14} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                              {user.city}, {user.township}
                            </Text>
                          </HStack>
                        </VStack>
                        <TouchableOpacity
                          onPress={() => sendRequestMutation.mutate(user._id)}
                          disabled={
                            isAlreadyFriend ||
                            hasPendingRequest ||
                            sendRequestMutation.isPending
                          }
                          className={`px-4 py-2 rounded-lg ${
                            isAlreadyFriend || hasPendingRequest
                              ? "bg-gray-200"
                              : "bg-blue-500"
                          }`}
                          style={{
                            opacity:
                              isAlreadyFriend ||
                              hasPendingRequest ||
                              sendRequestMutation.isPending
                                ? 0.6
                                : 1,
                          }}
                        >
                          {sendRequestMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text className="text-white font-semibold text-sm">
                              {isAlreadyFriend
                                ? t("alreadyFriends")
                                : hasPendingRequest
                                ? t("requestAlreadySent")
                                : t("sendRequest")}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </HStack>
                    </Card>
                  );
                })}
              </VStack>
            </Box>
          )}
        </Box>
      )}

      {/* Friend Requests */}
      {requests.length > 0 && (
        <Box className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
          <HStack className="items-center justify-between">
            <Text className="text-yellow-800 font-semibold">
              {t("pendingRequests")} ({requests.length})
            </Text>
            <TouchableOpacity onPress={() => refetchRequests()}>
              <Text className="text-blue-600 text-sm font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </HStack>
        </Box>
      )}

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingFriends}
            onRefresh={() => {
              refetchFriends();
              refetchRequests();
            }}
            tintColor="#3B82F6"
          />
        }
      >
        <Box className="px-4 py-6">
          {/* Friend Requests */}
          {requests.length > 0 && (
            <Box className="mb-6">
              <Heading className="text-xl font-semibold text-gray-800 mb-3">
                {t("friendRequests")}
              </Heading>
              <VStack space="sm">
                {requests.map((request) => (
                  <Card
                    key={request._id}
                    className="bg-white rounded-xl p-4 border border-yellow-200"
                  >
                    <VStack space="sm">
                      <Text className="text-gray-900 font-semibold">
                        {request.from._id === user?._id
                          ? request.to.name
                          : request.from.name}
                      </Text>
                      {request.from._id === user?._id ? (
                        request.to.phone && (
                          <Text className="text-blue-600 text-sm font-medium">
                            {formatPhoneNumber(request.to.phone)}
                          </Text>
                        )
                      ) : (
                        request.from.phone && (
                          <Text className="text-blue-600 text-sm font-medium">
                            {formatPhoneNumber(request.from.phone)}
                          </Text>
                        )
                      )}
                      {request.from._id !== user?._id && (
                        <HStack className="space-x-2 mt-2">
                          <TouchableOpacity
                            onPress={() =>
                              acceptRequestMutation.mutate(request._id)
                            }
                            disabled={acceptRequestMutation.isPending}
                            className="flex-1 bg-green-500 rounded-lg py-2 items-center"
                          >
                            <Text className="text-white font-semibold">
                              {t("accept")}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              rejectRequestMutation.mutate(request._id)
                            }
                            disabled={rejectRequestMutation.isPending}
                            className="flex-1 bg-red-500 rounded-lg py-2 items-center"
                          >
                            <Text className="text-white font-semibold">
                              {t("reject")}
                            </Text>
                          </TouchableOpacity>
                        </HStack>
                      )}
                    </VStack>
                  </Card>
                ))}
              </VStack>
            </Box>
          )}

          {/* Friends List */}
          {isLoadingFriends ? (
            <Box className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-4">Loading friends...</Text>
            </Box>
          ) : friends.length === 0 ? (
            <Box className="items-center justify-center py-12">
              <Users size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4 font-semibold">
                {t("noFriendsYet")}
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center px-4">
                {t("noFriendsMessage")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                className="mt-6 bg-blue-500 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold">
                  {t("addFriend")}
                </Text>
              </TouchableOpacity>
            </Box>
          ) : (
            <VStack space="md">
              <Heading className="text-xl font-semibold text-gray-800">
                {t("myFriends")}
              </Heading>
              {friends.map((friend) => {
                const StatusIcon = getStatusIcon(friend.isSafe);
                const statusColor = getStatusColor(friend.isSafe);

                return (
                  <Card
                    key={friend._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                  >
                    <HStack className="items-start justify-between">
                      <HStack className="flex-1 items-start space-x-3">
                        <Box
                          className="w-12 h-12 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${statusColor}20` }}
                        >
                          <StatusIcon size={24} color={statusColor} />
                        </Box>
                        <VStack className="flex-1">
                          <Text className="text-gray-900 font-semibold text-base">
                            {friend.name}
                          </Text>
                          <HStack className="items-center mt-1">
                            <Text className="text-blue-600 font-medium text-sm">
                              {formatPhoneNumber(friend.phone)}
                            </Text>
                          </HStack>
                          <HStack className="items-center mt-2">
                            <MapPin size={14} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                              {friend.city}, {friend.township}
                            </Text>
                          </HStack>
                          {friend.lastSeen && (
                            <Text className="text-gray-400 text-xs mt-1">
                              {t("lastSeen")}:{" "}
                              {new Date(friend.lastSeen).toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <TouchableOpacity
                        onPress={() => handleRemoveFriend(friend)}
                        className="p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </HStack>
                  </Card>
                );
              })}
            </VStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

