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
import WeatherStatus from "@/components/wather-status";
import PrecipitationAnalysis from "@/components/precipitation-analysis";
import FloodSafetyCheck from "@/components/flood-safety-check";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function HomeScreen() {
  const { t } = useLanguage();
  // For demo purposes - in real app, this would come from auth context
  const [isLoggedIn] = useState(false); // Change to true to see profile view
  const [userLocation] = useState("Yangon, Myanmar");
  const [floodRisk] = useState(90); // Percentage (0-100)
  const [weatherData] = useState({
    today: "sunny",
    tomorrow: "rainy",
    dayAfter: "sunny",
  });

  const getFloodRiskColor = (risk: number) => {
    if (risk < 40) return "#10B981"; // Green
    if (risk < 70) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const handleLoginPress = useCallback(() => {
    // Handle login navigation - will be implemented later
    console.log("Login pressed");
    router.push("/(auth)/login");
  }, []);

  const handleProfilePress = useCallback(() => {
    // Handle profile navigation - will be implemented later
    console.log("Profile pressed");
  }, []);

  const handleSafetyResponse = useCallback((isSafe: boolean) => {
    console.log("User safety status:", isSafe ? "Safe" : "Not Safe");
    // You can add additional logic here if needed
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView className="flex-1">
        {/* Location and Profile Header */}

        <Box className="bg-white px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <MapPin size={20} color="#3B82F6" />
              <Text
                className="text-gray-800 text-base font-medium"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {userLocation}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Pressable onPress={handleProfilePress}>
                  <View className="bg-blue-100 rounded-full p-2">
                    <User size={20} color="#3B82F6" />
                  </View>
                </Pressable>
              ) : (
                <Pressable onPress={handleLoginPress}>
                  <View className="bg-blue-500 px-4 py-2 rounded-full items-center justify-center">
                    <Text
                      className="text-white text-sm font-semibold"
                      style={{ fontFamily: "Z06-Walone-Bold" }}
                    >
                      {t("login")}
                    </Text>
                  </View>
                </Pressable>
              )}
            </HStack>
          </HStack>
        </Box>
        {/* Flood Risk Indicator */}
        <Box className="bg-white mb-4 mt-2 px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between mb-2">
            <Text
              className="text-gray-700 text-sm font-semibold"
              style={{ fontFamily: "Z06-Walone-Bold" }}
            >
              {t("floodRiskLevel")}
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
        {/* Safety Check Notification - appears after successful API call when risk > 80 */}
        <FloodSafetyCheck
          floodRisk={floodRisk}
          location={userLocation}
          onResponseSubmitted={handleSafetyResponse}
        />
        {/* Alert Messages (if needed) */}
        {floodRisk >= 70 && (
          <Box className="mx-4 mb-2  bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4">
            <HStack space="sm" className="items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <VStack className="flex-1">
                <Text
                  className="text-orange-800 font-semibold text-sm"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("highFloodRiskAlert")}
                </Text>
                <Text
                  className="text-orange-700 text-xs mt-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("highFloodRiskMessage")}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        <Box className="bg-white px-4 mx-4 mt-2 rounded-xl py-4">
          <WeatherStatus
            location={userLocation}
            data={{
              temperature: 28,
              feelsLike: 25,
              condition: "Partly Cloudy with Rain",
              humidity: 78,
              windSpeed: 12,
              windDirection: "NE",
              visibility: 8,
              pressure: 1013,
              pressureTrend: "down",
              uvIndex: 3,
              uvIndexLabel: "Moderate",
              dewPoint: 22,
              cloudCover: 65,
              airQuality: 42,
              airQualityLabel: "Good",
              sunrise: "6:24 AM",
              sunset: "7:45 PM",
              moonPhase: "Waxing Gibbous",
            }}
          />
        </Box>

        {/* Precipitation Analysis */}
        <Box className="bg-white px-4 mx-4 mt-4 rounded-xl py-4 mb-4">
          <PrecipitationAnalysis
            precipitation={{
              lastHour: 0.4,
              last24Hours: 2.3,
              next24HoursForecast: 4.5,
            }}
            floodRisk={{
              riskLevel: "MODERATE",
              soilSaturation: 85,
              riverLevels: "Rising",
              stormDrains: "Near Capacity",
              alertMessage:
                "Monitor conditions closely. Avoid low-lying areas and be prepared for possible evacuation.",
            }}
          />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
