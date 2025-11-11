import React, { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, ScrollView, Pressable, Alert, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { SelectList } from "react-native-dropdown-select-list";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+95 9123 456 789");
  const [city, setCity] = useState("1");
  const [township, setTownship] = useState("3");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const cities = [
    { key: "1", value: "Yangon" },
    { key: "2", value: "Mandalay" },
    { key: "3", value: "Naypyidaw" },
    { key: "4", value: "Bago" },
    { key: "5", value: "Taunggyi" },
  ];

  const townships = [
    { key: "1", value: "Lanmadaw", cityId: "1" },
    { key: "2", value: "Hlaing", cityId: "1" },
    { key: "3", value: "Kamayut", cityId: "1" },
    { key: "4", value: "Mayangone", cityId: "1" },
    { key: "5", value: "Sanchaung", cityId: "1" },
    { key: "6", value: "Chanmyathazi", cityId: "2" },
    { key: "7", value: "Maharaing", cityId: "2" },
    { key: "8", value: "Chanayethazan", cityId: "2" },
    { key: "9", value: "Pyigyidagun", cityId: "2" },
    { key: "10", value: "Amarapura", cityId: "2" },
    { key: "11", value: "Zabuthiri", cityId: "3" },
    { key: "12", value: "Pobbathiri", cityId: "3" },
    { key: "13", value: "Dekkhinathiri", cityId: "3" },
    { key: "14", value: "Ottarathiri", cityId: "3" },
  ];

  // Filter townships based on selected city
  const filteredTownships = city
    ? townships.filter(township => township.cityId === city)
    : townships;

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please fill in your name");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Profile updated:", { name, email, phone, city, township });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    setName("John Doe");
    setEmail("john.doe@example.com");
    setPhone("+95 9123 456 789");
    setCity("1");
    setTownship("3");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            console.log("User logged out");
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 10 }} showsVerticalScrollIndicator={false}>
        {/* Header Section - Simplified without profile photo */}
        <Box className="items-center mb-6">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={32} color="#2563eb" />
          </View>
          <Heading className="text-blue-800 text-2xl font-bold">
            {name}
          </Heading>
          <Text className="text-gray-600 text-base mt-1">{email}</Text>
        </Box>

        {/* Profile Information Section */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Box className="flex-row justify-between items-center mb-6">
            <Heading className="text-xl font-bold text-gray-800">Profile Information</Heading>
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
              className={`p-4 rounded-xl border ${isEditing ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
          </Box>

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <View className={`p-4 rounded-xl border bg-gray-50 border-gray-200`}>
              <Text className="text-gray-600">{email}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Email cannot be changed</Text>
          </Box>

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
            <View className={`p-4 rounded-xl border bg-gray-50 border-gray-200`}>
              <Text className="text-gray-600">{phone}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Phone number cannot be changed</Text>
          </Box>

          <Box className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">City</Text>
            <SelectList
              setSelected={setCity}
              data={cities}
              placeholder="Select City"
              defaultOption={cities.find(c => c.key === city)}
              boxStyles={{ 
                backgroundColor: isEditing ? "#f0f9ff" : "#f9fafb", 
                borderRadius: 12,
                borderColor: isEditing ? "#bfdbfe" : "#e5e7eb"
              }}
            //   disabled={!isEditing}
            />
          </Box>

          <Box className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Township</Text>
            <SelectList
              setSelected={setTownship}
              data={filteredTownships}
              placeholder="Select Township"
              defaultOption={filteredTownships.find(t => t.key === township)}
              boxStyles={{ 
                backgroundColor: isEditing ? "#f0f9ff" : "#f9fafb", 
                borderRadius: 12,
                borderColor: isEditing ? "#bfdbfe" : "#e5e7eb"
              }}
            //   disabled={!isEditing}
            />
          </Box>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={loading}
              className={`bg-blue-600 p-4 rounded-xl flex-row justify-center items-center ${loading ? "opacity-70" : ""}`}
            >
              {loading ? (
                <>
                  <Ionicons name="refresh" size={20} color="white" className="mr-2" />
                  <Text className="text-white text-center font-semibold text-lg">Saving...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Box>

        {/* Account Actions Section */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Heading className="text-xl font-bold text-gray-800 mb-4">Account Settings</Heading>

          <TouchableOpacity 
            onPress={() => console.log("Privacy settings")}
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
          >
            <Box className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={22} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-3">Privacy Settings</Text>
            </Box>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => console.log("Notification settings")}
            className="flex-row items-center justify-between p-4"
          >
            <Box className="flex-row items-center">
              <Ionicons name="notifications-outline" size={22} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-3">Notification Preferences</Text>
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
          <Text className="text-red-600 font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;