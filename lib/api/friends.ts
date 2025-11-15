import { apiClient } from "./client";

export interface Friend {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  township: string;
  isSafe?: boolean;
  lastSeen?: string;
  createdAt: string;
}

export interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  to: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface FriendsListResponse {
  success: boolean;
  friends: Friend[];
  count: number;
}

export interface FriendRequestResponse {
  success: boolean;
  message: string;
  request?: FriendRequest;
}

export interface SearchUsersResponse {
  success: boolean;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    township: string;
  }>;
}

export const friendsApi = {
  /**
   * Get list of user's friends
   * GET /api/v1/friends
   */
  getFriends: async (token: string): Promise<FriendsListResponse> => {
    return apiClient.authenticatedRequest<FriendsListResponse>(
      "/friends",
      token,
      {
        method: "GET",
      }
    );
  },

  /**
   * Search for users by phone number
   * GET /api/v1/friends/search?q=searchTerm
   * Note: Search term should be phone number (can include +, spaces, or just digits)
   */
  searchUsers: async (
    token: string,
    searchTerm: string
  ): Promise<SearchUsersResponse> => {
    // Clean phone number - remove spaces and keep only digits and +
    const cleanedTerm = searchTerm.replace(/\s/g, "");
    const queryParams = new URLSearchParams({ q: cleanedTerm });
    return apiClient.authenticatedRequest<SearchUsersResponse>(
      `/friends/search?${queryParams.toString()}`,
      token,
      {
        method: "GET",
      }
    );
  },

  /**
   * Send friend request
   * POST /api/v1/friends/request
   * Body: { friendId: string }
   */
  sendFriendRequest: async (
    token: string,
    friendId: string
  ): Promise<FriendRequestResponse> => {
    return apiClient.authenticatedRequest<FriendRequestResponse>(
      "/friends/request",
      token,
      {
        method: "POST",
        body: JSON.stringify({ friendId }),
      }
    );
  },

  /**
   * Accept friend request
   * POST /api/v1/friends/accept/:requestId
   */
  acceptFriendRequest: async (
    token: string,
    requestId: string
  ): Promise<FriendRequestResponse> => {
    return apiClient.authenticatedRequest<FriendRequestResponse>(
      `/friends/accept/${requestId}`,
      token,
      {
        method: "POST",
      }
    );
  },

  /**
   * Reject friend request
   * POST /api/v1/friends/reject/:requestId
   */
  rejectFriendRequest: async (
    token: string,
    requestId: string
  ): Promise<FriendRequestResponse> => {
    return apiClient.authenticatedRequest<FriendRequestResponse>(
      `/friends/reject/${requestId}`,
      token,
      {
        method: "POST",
      }
    );
  },

  /**
   * Get pending friend requests
   * GET /api/v1/friends/requests
   */
  getFriendRequests: async (
    token: string
  ): Promise<{ success: boolean; requests: FriendRequest[] }> => {
    return apiClient.authenticatedRequest<{
      success: boolean;
      requests: FriendRequest[];
    }>("/friends/requests", token, {
      method: "GET",
    });
  },

  /**
   * Remove a friend
   * DELETE /api/v1/friends/:friendId
   */
  removeFriend: async (
    token: string,
    friendId: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.authenticatedRequest<{
      success: boolean;
      message: string;
    }>(`/friends/${friendId}`, token, {
      method: "DELETE",
    });
  },
};

