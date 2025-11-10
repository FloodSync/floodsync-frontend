import React from "react";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudDrizzle,
  CloudLightning,
  Droplet,
  Wind,
  Eye,
  Gauge,
  Sun as SunIcon,
  Moon,
  Thermometer,
} from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";

type WeatherType = "sunny" | "cloudy" | "rainy" | "drizzle" | "stormy";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  pressureTrend?: "up" | "down" | "stable";
  uvIndex: number;
  uvIndexLabel?: string;
  dewPoint: number;
  cloudCover: number;
  airQuality: number;
  airQualityLabel?: string;
  sunrise: string;
  sunset: string;
  moonPhase: string;
}

interface WeatherStatusProps {
  weather?: WeatherType;
  location?: string;
  data?: Partial<WeatherData>;
}

const WeatherStatus: React.FC<WeatherStatusProps> = ({
  weather = "cloudy",
  location = "Current Location",
  data,
}) => {
  const { t } = useLanguage();
  // Mock data - will be replaced with actual data from props
  const weatherData: WeatherData = {
    temperature: data?.temperature ?? 28,
    feelsLike: data?.feelsLike ?? 25,
    condition: data?.condition ?? "Partly Cloudy with Rain",
    humidity: data?.humidity ?? 78,
    windSpeed: data?.windSpeed ?? 12,
    windDirection: data?.windDirection ?? "NE",
    visibility: data?.visibility ?? 8,
    pressure: data?.pressure ?? 1013,
    pressureTrend: data?.pressureTrend ?? "down",
    uvIndex: data?.uvIndex ?? 3,
    uvIndexLabel: data?.uvIndexLabel ?? "Moderate",
    dewPoint: data?.dewPoint ?? 22,
    cloudCover: data?.cloudCover ?? 65,
    airQuality: data?.airQuality ?? 42,
    airQualityLabel: data?.airQualityLabel ?? "Good",
    sunrise: data?.sunrise ?? "6:24 AM",
    sunset: data?.sunset ?? "7:45 PM",
    moonPhase: data?.moonPhase ?? "Waxing Gibbous",
  };

  const getWeatherIcon = (type: WeatherType, size: number = 64) => {
    switch (type) {
      case "sunny":
        return <Sun size={size} color="#F59E0B" />;
      case "cloudy":
        return <Cloud size={size} color="#6B7280" />;
      case "rainy":
        return <CloudRain size={size} color="#3B82F6" />;
      case "drizzle":
        return <CloudDrizzle size={size} color="#60A5FA" />;
      case "stormy":
        return <CloudLightning size={size} color="#6366F1" />;
      default:
        return <Cloud size={size} color="#6B7280" />;
    }
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return "#10B981"; // Green - Low
    if (index <= 5) return "#F59E0B"; // Yellow - Moderate
    if (index <= 7) return "#F97316"; // Orange - High
    return "#EF4444"; // Red - Very High
  };

  const getAirQualityColor = (aqi: number) => {
    if (aqi <= 50) return "#10B981"; // Good
    if (aqi <= 100) return "#F59E0B"; // Moderate
    return "#EF4444"; // Unhealthy
  };

  return (
    <VStack space="md">
      {/* Header */}
      <VStack space="xs">
        <Text
          className="text-gray-900 text-xl font-bold"
          style={{ fontFamily: "Z06-Walone-Bold" }}
        >
          {t("currentWeatherConditions")}
        </Text>
        <Text
          className="text-gray-600 text-sm"
          style={{ fontFamily: "Z06-Walone-Regular" }}
        >
          {location}
        </Text>
      </VStack>
      {/* Main Weather Card and Detailed Conditions */}
      <HStack space="md" className="items-start">
        {/* Main Weather Display */}
        <Box className="flex-1 bg-blue-50 rounded-xl p-4">
          <VStack space="md">
            <Box className="items-center">
              <Thermometer size={32} color="#3B82F6" />
            </Box>
            <VStack space="xs" className="items-center">
              <Text
                className="text-gray-900 text-4xl font-bold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.temperature}°
              </Text>
              <Text
                className="text-gray-700 text-base text-center"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {weatherData.condition}
              </Text>
              <Text
                className="text-gray-500 text-sm"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {t("feelsLike")} {weatherData.feelsLike}°C
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Detailed Conditions Cards */}
        <VStack space="sm" className="flex-1">
          {/* Humidity */}
          <Box className="bg-blue-50 rounded-xl p-3">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <Droplet size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("humidity")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.humidity}%
              </Text>
            </HStack>
          </Box>

          {/* Wind */}
          <Box className="bg-blue-50 rounded-xl p-3">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <Wind size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("wind")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.windSpeed} mph {weatherData.windDirection}
              </Text>
            </HStack>
          </Box>

          {/* Visibility */}
          <Box className="bg-blue-50 rounded-xl p-3">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <Eye size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("visibility")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.visibility} mi
              </Text>
            </HStack>
          </Box>

          {/* Pressure */}
          <Box className="bg-blue-50 rounded-xl p-3">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <Gauge size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("pressure")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.pressure} mb{" "}
                {weatherData.pressureTrend === "down" ? "↓" : "↑"}
              </Text>
            </HStack>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default WeatherStatus;
