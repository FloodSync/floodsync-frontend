import React from "react";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import {
  CloudRain,
  Droplet,
  Wind,
  Eye,
  Gauge,
  Thermometer,
  Sun,
  Cloud,
  CloudDrizzle,
  CloudLightning,
} from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  precipitation: number;
  rain: number;
  showers: number;
}

interface WeatherStatusProps {
  location?: string;
  data?: Partial<WeatherData>;
}

const WeatherStatus: React.FC<WeatherStatusProps> = ({
  location = "Current Location",
  data,
}) => {
  const { t } = useLanguage();

  if (!data) {
    return null;
  }

  const weatherData: WeatherData = {
    temperature: data.temperature ?? 0,
    feelsLike: data.feelsLike ?? 0,
    condition: data.condition ?? "Unknown",
    humidity: data.humidity ?? 0,
    windSpeed: data.windSpeed ?? 0,
    windDirection: data.windDirection ?? "N",
    visibility: data.visibility ?? 0,
    pressure: data.pressure ?? 0,
    precipitation: data.precipitation || 0,
    rain: data.rain || 0,
    showers: data.showers || 0,
  };

  const getPrecipitationLabel = (
    precipitation: number,
    rain: number,
    showers: number
  ): string => {
    const total = precipitation || rain || showers;
    if (total === 0) return "No rain";
    if (total < 0.5) return "Light rain";
    if (total < 2.5) return "Moderate rain";
    if (total < 10) return "Heavy rain";
    return "Very heavy rain";
  };

  const getWeatherIcon = () => {
    const condition = weatherData.condition.toLowerCase();
    const size = 64;

    if (condition.includes("clear") || condition.includes("sunny")) {
      return <Sun size={size} color="#F59E0B" />;
    }
    if (condition.includes("cloudy") || condition.includes("partly")) {
      return <Cloud size={size} color="#6B7280" />;
    }
    if (
      condition.includes("rain") ||
      condition.includes("drizzle") ||
      condition.includes("shower")
    ) {
      return <CloudRain size={size} color="#3B82F6" />;
    }
    if (condition.includes("thunder") || condition.includes("storm")) {
      return <CloudLightning size={size} color="#6366F1" />;
    }
    if (condition.includes("fog") || condition.includes("mist")) {
      return <Cloud size={size} color="#9CA3AF" />;
    }
    // Default to cloud
    return <Cloud size={size} color="#6B7280" />;
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
      <HStack space="md" className="items-stretch">
        {/* Detailed Conditions Cards */}
        <VStack space="sm" className="flex-1">
          {/* Humidity */}
          <Box className="bg-blue-50 rounded-xl p-3 min-h-[60px] justify-center">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <Droplet size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium flex-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("humidity")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold ml-2"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.humidity}%
              </Text>
            </HStack>
          </Box>

          {/* Wind */}
          <Box className="bg-blue-50 rounded-xl p-3 min-h-[60px] justify-center">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <Wind size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium flex-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("wind")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold ml-2 text-right"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.windSpeed} km/h{"\n"}
                <Text className="text-gray-600 text-xs">
                  {weatherData.windDirection}
                </Text>
              </Text>
            </HStack>
          </Box>

          {/* Visibility */}
          <Box className="bg-blue-50 rounded-xl p-3 min-h-[60px] justify-center">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <Eye size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium flex-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("visibility")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold ml-2"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.visibility} mi
              </Text>
            </HStack>
          </Box>

          {/* Pressure */}
          <Box className="bg-blue-50 rounded-xl p-3 min-h-[60px] justify-center">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <Gauge size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium flex-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("pressure")}
                </Text>
              </HStack>
              <Text
                className="text-gray-900 text-sm font-semibold ml-2"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.pressure} mb
              </Text>
            </HStack>
          </Box>

          {/* Precipitation/Rain */}
          <Box className="bg-blue-50 rounded-xl p-3 min-h-[60px] justify-center">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <CloudRain size={20} color="#3B82F6" />
                <Text
                  className="text-gray-700 text-sm font-medium flex-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("rain") || "Rain"}
                </Text>
              </HStack>
              <VStack space="xs" className="items-end ml-2">
                <Text
                  className="text-gray-900 text-sm font-semibold text-right"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {getPrecipitationLabel(
                    weatherData.precipitation,
                    weatherData.rain,
                    weatherData.showers
                  )}
                </Text>
                {(weatherData.precipitation > 0 ||
                  weatherData.rain > 0 ||
                  weatherData.showers > 0) && (
                  <Text
                    className="text-gray-600 text-xs"
                    style={{ fontFamily: "Z06-Walone-Regular" }}
                  >
                    {(
                      weatherData.precipitation ||
                      weatherData.rain ||
                      weatherData.showers
                    ).toFixed(1)}{" "}
                    mm
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
        </VStack>

        {/* Main Weather Display with Icon */}
        <Box className="w-[140px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 justify-center">
          <VStack space="md" className="items-center">
            <Box className="items-center">{getWeatherIcon()}</Box>
            <VStack space="xs" className="items-center">
              <Text
                className="text-gray-900 text-2xl font-bold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {weatherData.temperature}°
              </Text>
              <Text
                className="text-gray-700 text-sm text-center leading-tight"
                style={{ fontFamily: "Z06-Walone-Regular" }}
                numberOfLines={2}
              >
                {weatherData.condition}
              </Text>
              <Text
                className="text-gray-500 text-xs text-center"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {t("feelsLike")} {weatherData.feelsLike}°
              </Text>
            </VStack>
          </VStack>
        </Box>
      </HStack>
    </VStack>
  );
};

export default WeatherStatus;