import React, { useState, useCallback } from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import {
  MapPin,
  User,
  Cloud,
  CloudRain,
  Sun,
  AlertCircle,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  // For demo purposes - in real app, this would come from auth context
  const [isLoggedIn] = useState(false); // Change to true to see profile view
  const [userLocation] = useState("Yangon, Myanmar");
  const [floodRisk] = useState(90); // Percentage (0-100)
  const [weatherData] = useState({
    today: "cloudy",
    tomorrow: "rainy",
    dayAfter: "sunny",
  });

  const getFloodRiskColor = (risk: number) => {
    if (risk < 40) return "#10B981"; // Green
    if (risk < 70) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case "cloudy":
        return <Cloud size={32} color="#6B7280" />;
      case "rainy":
        return <CloudRain size={32} color="#3B82F6" />;
      case "sunny":
        return <Sun size={32} color="#F59E0B" />;
      default:
        return <Cloud size={32} color="#6B7280" />;
    }
  };

  const handleLoginPress = useCallback(() => {
    // Handle login navigation - will be implemented later
    console.log("Login pressed");
    router.push("/(auth)/profile");
  }, []);

  const handleProfilePress = useCallback(() => {
    // Handle profile navigation - will be implemented later
    console.log("Profile pressed");
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1">
        {/* Location and Profile Header */}

        <Box className="bg-white px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <MapPin size={20} color="#3B82F6" />
              <Text className="text-gray-800 text-base font-medium">
                {userLocation}
              </Text>
            </HStack>
            {isLoggedIn ? (
              <Pressable onPress={handleProfilePress}>
                <View className="bg-blue-100 rounded-full p-2">
                  <User size={20} color="#3B82F6" />
                </View>
              </Pressable>
            ) : (
              <Pressable onPress={handleLoginPress}>
                <View className="bg-blue-500 px-4 py-2 rounded-full items-center justify-center">
                  <Text className="text-white text-sm font-semibold">
                    Login
                  </Text>
                </View>
              </Pressable>
            )}
          </HStack>
        </Box>
        {/* Flood Risk Indicator */}
        <Box className="bg-white px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between mb-2">
            <Text className="text-gray-700 text-sm font-semibold">
              Flood Risk Level
            </Text>
            <Text
              className="text-sm font-bold"
              style={{ color: getFloodRiskColor(floodRisk) }}
            >
              {floodRisk}%
            </Text>
          </HStack>
          <Box className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <Box
              className="h-full rounded-full"
              style={{
                width: `${floodRisk}%`,
                backgroundColor: getFloodRiskColor(floodRisk),
              }}
            />
          </Box>
        </Box>
        {/* Alert Messages (if needed) */}
        {floodRisk >= 70 && (
          <Box className="mx-4 mb-4 bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4">
            <HStack space="sm" className="items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <VStack className="flex-1">
                <Text className="text-orange-800 font-semibold text-sm">
                  High Flood Risk Alert yall
                </Text>
                <Text className="text-orange-700 text-xs mt-1">
                  Your current location has high chance of flooding. Please stay
                  alert.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
