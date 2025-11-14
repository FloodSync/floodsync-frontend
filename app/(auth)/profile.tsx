import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SelectList } from "react-native-dropdown-select-list";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateUser, useCurrentUser } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-auth";
import { myanmarCities, myanmarTownships } from "@/lib/data/myanmar-locations";

const Profile = () => {
  const { user: authUser, token, isAuthenticated } = useAuthStore();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const logoutMutation = useLogout();

  const user = currentUser || authUser;

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [township, setTownship] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCity(user.city || "");
      setTownship(user.township || "");
    }
  }, [user]);

  useEffect(() => {
    if (city && isEditing) {
      const newTownships = myanmarTownships.filter((t) => t.cityId === city);
      const currentTownshipExists = newTownships.some(
        (t) => t.key === township
      );
      if (!currentTownshipExists) {
        setTownship("");
      }
    }
  }, [city, isEditing]);

  const cities = myanmarCities.map((city) => ({
    key: city.key,
    value: city.value,
  }));

  const filteredTownships = city
    ? myanmarTownships
        .filter((t) => t.cityId === city)
        .map((t) => ({ key: t.key, value: t.value }))
    : [];

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please fill in your name");
      return;
    }

    if (!city) {
      Alert.alert("Error", "Please select a city");
      return;
    }

    if (!township) {
      Alert.alert("Error", "Please select a township");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        name: name.trim(),
        city,
        township,
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to update profile. Please try again."
      );
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setName(user.name || "");
      setCity(user.city || "");
      setTownship(user.township || "");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate();
        },
      },
    ]);
  };

  if (!isAuthenticated || !token) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <Box className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-600 text-center mb-4">
            Please login to view your profile
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </Box>
      </SafeAreaView>
    );
  }

  if (isLoadingUser) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <Box className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-600 text-center mb-4">
            Unable to load user data
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
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

      <ScrollView
        contentContainerStyle={{ padding: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Enhanced Profile Icon */}
        <Box className="items-center mb-6">
          <View
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full items-center justify-center mb-4 shadow-lg"
            style={{
              backgroundColor: "#3B82F6",
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Heading className="text-blue-800 text-2xl font-bold">{name}</Heading>
          <Text className="text-gray-600 text-base mt-1">{user.email}</Text>
        </Box>

        {/* Profile Information Section */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Box className="flex-row justify-between items-center mb-6">
            <Heading className="text-xl font-bold text-gray-800">
              Profile Information
            </Heading>
            {!isEditing ? (
              <TouchableOpacity
                onPress={handleEditPress}
                className="flex-row items-center bg-blue-50 px-4 py-2 rounded-xl"
              >
                <Ionicons name="create-outline" size={18} color="#2563eb" />
                <Text className="text-blue-600 font-semibold ml-2">Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleCancelEdit}
                className="flex-row items-center bg-gray-100 px-4 py-2 rounded-xl"
              >
                <Ionicons name="close" size={18} color="#6b7280" />
                <Text className="text-gray-600 font-semibold ml-2">Cancel</Text>
              </TouchableOpacity>
            )}
          </Box>

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
            <TextInput
              className={`p-4 rounded-xl border ${
                isEditing
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
          </Box>

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">
              Email Address
            </Text>
            <View
              className={`p-4 rounded-xl border bg-gray-50 border-gray-200`}
            >
              <Text className="text-gray-600">{user.email}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              Email cannot be changed
            </Text>
          </Box>

          {user.phone && (
            <Box className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">
                Phone Number
              </Text>
              <View
                className={`p-4 rounded-xl border bg-gray-50 border-gray-200`}
              >
                <Text className="text-gray-600">{user.phone}</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                Phone number cannot be changed
              </Text>
            </Box>
          )}

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">City</Text>
            {isEditing ? (
              <SelectList
                setSelected={setCity}
                data={cities}
                placeholder="Select City"
                defaultOption={cities.find((c) => c.key === city)}
                boxStyles={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: 12,
                  borderColor: "#bfdbfe",
                }}
              />
            ) : (
              <View className="p-4 rounded-xl border bg-gray-50 border-gray-200">
                <Text className="text-gray-600">
                  {cities.find((c) => c.key === city)?.value || "Not set"}
                </Text>
              </View>
            )}
          </Box>

          <Box className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Township</Text>
            {isEditing ? (
              <SelectList
                setSelected={setTownship}
                data={filteredTownships}
                placeholder="Select Township"
                defaultOption={filteredTownships.find(
                  (t) => t.key === township
                )}
                boxStyles={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: 12,
                  borderColor: "#bfdbfe",
                }}
              />
            ) : (
              <View className="p-4 rounded-xl border bg-gray-50 border-gray-200">
                <Text className="text-gray-600">
                  {filteredTownships.find((t) => t.key === township)?.value ||
                    "Not set"}
                </Text>
              </View>
            )}
          </Box>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={updateUserMutation.isPending}
              className={`bg-blue-600 p-4 rounded-xl flex-row justify-center items-center ${
                updateUserMutation.isPending ? "opacity-70" : ""
              }`}
            >
              {updateUserMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Saving...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Box>

        {/* Account Actions Section */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Heading className="text-xl font-bold text-gray-800 mb-4">
            Account Settings
          </Heading>

          <TouchableOpacity
            onPress={() => console.log("Privacy settings")}
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
          >
            <Box className="flex-row items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#6b7280"
              />
              <Text className="text-gray-700 font-medium ml-3">
                Privacy Settings
              </Text>
            </Box>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Notification settings")}
            className="flex-row items-center justify-between p-4"
          >
            <Box className="flex-row items-center">
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#6b7280"
              />
              <Text className="text-gray-700 font-medium ml-3">
                Notification Preferences
              </Text>
            </Box>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Box>

        {/* Logout Section */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 p-4 rounded-2xl flex-row justify-center items-center border border-red-200 mb-6"
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text className="text-red-600 font-semibold text-lg ml-2">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
