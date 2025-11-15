import React, { useCallback, useMemo, useState } from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ActivityIndicator, RefreshControl } from "react-native";
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
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location";
import {
  useWeather,
  useFloodData,
  usePrecipitation,
} from "@/hooks/use-weather";
import { useFloodNotifications } from "@/hooks/use-flood-notifications";
import {
  APP_CONFIG,
  isDemoMode,
  getDemoFloodRisk,
} from "@/lib/config/app-config";
import { myanmarCities, myanmarTownships } from "@/lib/data/myanmar-locations";
import FloodSafetyCheck from "@/components/flood-safety-check";
import ResourceSurvey from "@/components/resource-survey";
import { ResourceType } from "@/lib/api/resources";

const getWeatherCondition = (code: number, isDay: number): string => {
  if (code === 0) return isDay ? "Clear Sky" : "Clear Night";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 57) return "Freezing Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
};

const getWindDirection = (degrees: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[Math.round(degrees / 22.5) % 16];
};

export default function HomeScreen() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const {
    coordinates,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  const weatherQuery = useWeather(
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  );

  const floodQuery = useFloodData(
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  );
  const precipitationQuery = usePrecipitation(
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  );

  const userLocation = useMemo(() => {
    if (isDemoMode()) {
      return APP_CONFIG.DEMO_DATA.location;
    }

    if (isAuthenticated && user && user.city) {
      const cityData = myanmarCities.find((c) => c.key === user.city);
      const townshipData = user.township
        ? myanmarTownships.find((t) => t.key === user.township)
        : null;

      const cityName = cityData?.value || user.city;
      const townshipName = townshipData?.value || user.township || "";

      if (townshipName) {
        return `${cityName}, ${townshipName}`;
      }
      return cityName;
    }

    if (coordinates?.city) {
      if (coordinates.township) {
        return `${coordinates.city}, ${coordinates.township}`;
      }
      return coordinates.city;
    }
    if (coordinates) {
      return `${coordinates.latitude.toFixed(
        2
      )}, ${coordinates.longitude.toFixed(2)}`;
    }
    return "Getting location...";
  }, [isAuthenticated, user, coordinates]);

  const floodRisk = useMemo(() => {
    if (isDemoMode()) {
      return getDemoFloodRisk();
    }

    if (floodQuery.data?.current?.flood_risk !== undefined) {
      return Math.round(floodQuery.data.current.flood_risk);
    }
    return 0;
  }, [floodQuery.data]);
  useFloodNotifications({
    floodRisk,
    location: userLocation,
    enabled:
      isDemoMode() ||
      (!locationLoading && !floodQuery.isLoading && floodRisk > 0),
  });

  const weatherData = useMemo(() => {
    if (isDemoMode()) {
      return APP_CONFIG.DEMO_DATA.weather;
    }

    if (!weatherQuery.data?.current) return null;

    const current = weatherQuery.data.current;
    const condition = getWeatherCondition(current.weather_code, current.is_day);
    const windDir = getWindDirection(current.wind_direction_10m);

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.temperature_2m - 2),
      condition,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: windDir,
      visibility: Math.round((current.visibility || 10000) / 1000),
      pressure: Math.round(current.surface_pressure),
      precipitation: current.precipitation || 0,
      rain: current.rain || 0,
      showers: current.showers || 0,
    };
  }, [weatherQuery.data]);

  const precipitationData = useMemo(() => {
    if (isDemoMode()) {
      return APP_CONFIG.DEMO_DATA.precipitation;
    }

    if (!precipitationQuery.data?.hourly) return null;

    const { time, precipitation } = precipitationQuery.data.hourly;
    const totalHours = precipitation.length;

    if (totalHours < 48) {
      console.warn("Expected 48 hours of data, got:", totalHours);
    }

    const lastHourIndex = 23;
    const lastHour =
      lastHourIndex < precipitation.length
        ? precipitation[lastHourIndex] || 0
        : 0;

    const past24Hours = precipitation
      .slice(0, 24)
      .reduce((sum, val) => sum + (val || 0), 0);

    const future24Hours = precipitation
      .slice(24, 48)
      .reduce((sum, val) => sum + (val || 0), 0);

    return {
      lastHour: Math.round(lastHour * 10) / 10,
      last24Hours: Math.round(past24Hours * 10) / 10,
      next24HoursForecast: Math.round(future24Hours * 10) / 10,
    };
  }, [precipitationQuery.data]);

  const getFloodRiskColor = (risk: number) => {
    if (risk < 40) return "#10B981";
    if (risk < 70) return "#F59E0B";
    return "#EF4444";
  };

  const handleLoginPress = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push("/(auth)/profile");
  }, []);

  const handleSafetyResponse = useCallback((isSafe: boolean) => {
    console.log("User safety status:", isSafe ? "Safe" : "Not Safe");
    // You can add additional logic here if needed
  }, []);

  const handleResourcesSubmitted = useCallback((resources: ResourceType[]) => {
    console.log("User resource needs submitted:", resources);
    // You can add additional logic here if needed
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        weatherQuery.refetch(),
        floodQuery.refetch(),
        precipitationQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [weatherQuery, floodQuery, precipitationQuery]);

  const isRefreshing =
    refreshing ||
    weatherQuery.isRefetching ||
    floodQuery.isRefetching ||
    precipitationQuery.isRefetching;

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      >
        <Box className="bg-white px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between">
            <VStack className="flex-1">
              <HStack space="sm" className="items-center">
                <MapPin size={20} color="#3B82F6" />
                <Text
                  className="text-gray-800 text-base font-medium"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {userLocation}
                </Text>
              </HStack>
              {isAuthenticated && user && (
                <HStack space="xs" className="items-center mt-1">
                  <User size={14} color="#10B981" />
                  <Text
                    className="text-green-600 text-xs font-medium"
                    style={{ fontFamily: "Z06-Walone-Regular" }}
                  >
                    {user.name} • {user.email}
                  </Text>
                </HStack>
              )}
            </VStack>
            <HStack space="sm" className="items-center">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Pressable
                  onPress={handleProfilePress}
                  disabled={logoutMutation.isPending}
                >
                  <View
                    className="bg-blue-600 rounded-full p-2.5 shadow-md"
                    style={{
                      shadowColor: "#3B82F6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 4,
                    }}
                  >
                    <User size={22} color="#FFFFFF" strokeWidth={2.5} />
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

        <Box className="bg-white mb-4 mt-2 px-4 py-4 border-b border-gray-200">
          <HStack className="items-center justify-between mb-2">
            <Text
              className="text-gray-700 text-sm font-semibold"
              style={{ fontFamily: "Z06-Walone-Bold" }}
            >
              {t("floodRiskLevel")}
            </Text>
            {floodQuery.isLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text
                className="text-sm font-bold"
                style={{ color: getFloodRiskColor(floodRisk) }}
              >
                {floodRisk}%
              </Text>
            )}
          </HStack>
          <Box
            className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-sm"
            style={{ elevation: 2 }}
          >
            {floodQuery.isLoading ? (
              <Box className="h-full bg-gray-300 rounded-full" />
            ) : (
              <Box
                className="h-full rounded-full shadow-md"
                style={{
                  width: `${Math.max(floodRisk, 5)}%`,
                  backgroundColor: getFloodRiskColor(floodRisk),
                  shadowColor: getFloodRiskColor(floodRisk),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              />
            )}
          </Box>
        </Box>
        {!floodQuery.isLoading && floodRisk >= 70 && (
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

        <FloodSafetyCheck
          floodRisk={floodRisk}
          location={userLocation}
          onResponseSubmitted={handleSafetyResponse}
        />

        <ResourceSurvey
          floodRisk={floodRisk}
          location={userLocation}
          onResourcesSubmitted={handleResourcesSubmitted}
        />

        <Box className="bg-white px-4 mx-4 mt-2 rounded-xl py-4">
          {locationLoading || weatherQuery.isLoading ? (
            <VStack space="md" className="items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                Loading weather data...
              </Text>
            </VStack>
          ) : locationError || weatherQuery.isError ? (
            <VStack space="sm" className="items-center py-4">
              <AlertCircle size={32} color="#EF4444" />
              <Text
                className="text-red-600 text-sm text-center"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {locationError || "Failed to load weather data"}
              </Text>
            </VStack>
          ) : weatherData ? (
            <WeatherStatus location={userLocation} data={weatherData} />
          ) : null}
        </Box>

        <Box className="bg-white px-4 mx-4 mt-4 rounded-xl py-4 mb-4">
          {precipitationQuery.isLoading || locationLoading ? (
            <VStack space="md" className="items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                Loading precipitation data...
              </Text>
            </VStack>
          ) : precipitationQuery.isError || locationError ? (
            <VStack space="sm" className="items-center py-4">
              <AlertCircle size={32} color="#EF4444" />
              <Text
                className="text-red-600 text-sm text-center"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {locationError || "Failed to load precipitation data"}
              </Text>
            </VStack>
          ) : (
            <PrecipitationAnalysis
              precipitation={precipitationData || undefined}
              floodRisk={{
                riskLevel:
                  floodRisk < 40
                    ? "LOW"
                    : floodRisk < 70
                    ? "MODERATE"
                    : floodRisk < 90
                    ? "HIGH"
                    : "SEVERE",
                soilSaturation: Math.min(100, Math.round(floodRisk * 1.2)),
                riverLevels:
                  floodRisk < 40
                    ? "Normal"
                    : floodRisk < 70
                    ? "Rising"
                    : "High",
                stormDrains:
                  floodRisk < 40
                    ? "Normal"
                    : floodRisk < 70
                    ? "Near Capacity"
                    : "At Capacity",
                alertMessage: floodRisk >= 70 ? t("alertMessage") : undefined,
              }}
            />
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
