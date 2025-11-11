import React from "react";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import { AlertCircle, Droplet, TrendingUp, Sun } from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrecipitationData {
  lastHour: number;
  last24Hours: number;
  next24HoursForecast: number;
}

interface FloodRiskData {
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  soilSaturation: number;
  riverLevels: "Normal" | "Rising" | "High";
  stormDrains: "Normal" | "Near Capacity" | "At Capacity";
  alertMessage?: string;
}

interface PrecipitationAnalysisProps {
  precipitation?: Partial<PrecipitationData>;
  floodRisk?: Partial<FloodRiskData>;
}

const PrecipitationAnalysis: React.FC<PrecipitationAnalysisProps> = ({
  precipitation,
  floodRisk,
}) => {
  const { t } = useLanguage();

  if (!precipitation) {
    return null;
  }

  const precipData: PrecipitationData = {
    lastHour: precipitation.lastHour ?? 0,
    last24Hours: precipitation.last24Hours ?? 0,
    next24HoursForecast: precipitation.next24HoursForecast ?? 0,
  };

  const riskData: FloodRiskData = {
    riskLevel: floodRisk?.riskLevel ?? "LOW",
    soilSaturation: floodRisk?.soilSaturation ?? 0,
    riverLevels: floodRisk?.riverLevels ?? "Normal",
    stormDrains: floodRisk?.stormDrains ?? "Normal",
    alertMessage: floodRisk?.alertMessage,
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "#10B981"; // Green
      case "MODERATE":
        return "#F59E0B"; // Yellow/Orange
      case "HIGH":
        return "#F97316"; // Orange
      case "SEVERE":
        return "#EF4444"; // Red
      default:
        return "#F59E0B";
    }
  };

  const getRainfallIntensity = (mm: number) => {
    // Convert thresholds: 2.5 inches ≈ 63.5 mm, 5 inches ≈ 127 mm
    if (mm < 63.5)
      return { label: "Light", color: "#D1FAE5", textColor: "#065F46" };
    if (mm <= 127)
      return { label: "Moderate", color: "#FEF3C7", textColor: "#92400E" };
    return { label: "Heavy", color: "#FCE7F3", textColor: "#9F1239" };
  };

  const getMaxPrecipitation = () => {
    const max = Math.max(
      precipData.lastHour,
      precipData.last24Hours,
      precipData.next24HoursForecast
    );
    return max > 0 ? max : 1; // Avoid division by zero
  };

  const maxPrecip = getMaxPrecipitation();

  return (
    <VStack space="lg">
      {/* Precipitation Analysis Section */}
      <VStack space="md">
        <Text
          className="text-gray-900 text-xl font-bold"
          style={{ fontFamily: "Z06-Walone-Bold" }}
        >
          {t("rainInformation")}
        </Text>
        <Text
          className="text-gray-600 text-base"
          style={{ fontFamily: "Z06-Walone-Regular" }}
        >
          {t("rainDescription")}
        </Text>

        {/* Rainfall Measurements */}
        <VStack space="md">
          {/* Last Hour */}
          <VStack space="xs">
            <HStack className="items-center justify-between mb-1">
              <Text
                className="text-gray-700 text-base font-semibold"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {t("lastHour")}
              </Text>
              <Text
                className="text-gray-900 text-base font-bold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {precipData.lastHour} mm
              </Text>
            </HStack>
            <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <Box
                className="h-full bg-gray-800 rounded-full"
                style={{
                  width: `${(precipData.lastHour / maxPrecip) * 100}%`,
                }}
              />
            </Box>
          </VStack>

          {/* Last 24 Hours */}
          <VStack space="xs">
            <HStack className="items-center justify-between mb-1">
              <Text
                className="text-gray-700 text-base font-semibold"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {t("last24Hours")}
              </Text>
              <Text
                className="text-gray-900 text-base font-bold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {precipData.last24Hours} mm
              </Text>
            </HStack>
            <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <Box
                className="h-full bg-gray-800 rounded-full"
                style={{
                  width: `${(precipData.last24Hours / maxPrecip) * 100}%`,
                }}
              />
            </Box>
          </VStack>

          {/* Next 24 Hours Forecast */}
          <VStack space="xs">
            <HStack className="items-center justify-between mb-1">
              <Text
                className="text-gray-700 text-base font-semibold"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {t("next24Hours")}
              </Text>
              <Text
                className={
                  precipData.next24HoursForecast > 0
                    ? "text-orange-600 text-base font-bold"
                    : "text-green-600 text-base font-bold"
                }
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {precipData.next24HoursForecast} mm
              </Text>
            </HStack>
            <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <Box
                className={`h-full rounded-full ${
                  precipData.next24HoursForecast > 0
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    (precipData.next24HoursForecast / maxPrecip) * 100
                  }%`,
                }}
              />
            </Box>
            {/* Positive message when no rain forecast */}
            {precipData.next24HoursForecast === 0 && (
              <Box className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 mt-2">
                <HStack space="sm" className="items-center">
                  <Sun size={20} color="#10B981" />
                  <VStack className="flex-1">
                    <Text
                      className="text-green-800 text-sm font-semibold"
                      style={{ fontFamily: "Z06-Walone-Bold" }}
                    >
                      Clear Weather Ahead
                    </Text>
                    <Text
                      className="text-green-700 text-xs mt-0.5"
                      style={{ fontFamily: "Z06-Walone-Regular" }}
                    >
                      No rain expected in the next 24 hours. Perfect weather for
                      outdoor activities!
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </VStack>
        </VStack>

        {/* Rainfall Intensity Categories */}
        <HStack space="sm" className="mt-2">
          <Box
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: "#D1FAE5" }}
          >
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: "#065F46", fontFamily: "Z06-Walone-Bold" }}
            >
              {t("lightRain")}
            </Text>
            <Text
              className="text-xs text-center mt-1"
              style={{ color: "#065F46", fontFamily: "Z06-Walone-Regular" }}
            >
              {t("lessThan")} 63.5 mm
            </Text>
          </Box>
          <Box
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: "#FEF3C7" }}
          >
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: "#92400E", fontFamily: "Z06-Walone-Bold" }}
            >
              {t("mediumRain")}
            </Text>
            <Text
              className="text-xs text-center mt-1"
              style={{ color: "#92400E", fontFamily: "Z06-Walone-Regular" }}
            >
              63.5 {t("to")} 127 mm
            </Text>
          </Box>
          <Box
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: "#FCE7F3" }}
          >
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: "#9F1239", fontFamily: "Z06-Walone-Bold" }}
            >
              {t("heavyRain")}
            </Text>
            <Text
              className="text-xs text-center mt-1"
              style={{ color: "#9F1239", fontFamily: "Z06-Walone-Regular" }}
            >
              {t("moreThan")} 127 mm
            </Text>
          </Box>
        </HStack>
      </VStack>

      {/* Flood Risk Assessment Section */}
      <VStack space="md">
        <Text
          className="text-gray-900 text-xl font-bold"
          style={{ fontFamily: "Z06-Walone-Bold" }}
        >
          {t("floodDanger")}
        </Text>
        <Text
          className="text-gray-600 text-base"
          style={{ fontFamily: "Z06-Walone-Regular" }}
        >
          {t("floodDangerDescription")}
        </Text>

        {/* Risk Level Button */}
        <Box
          className="rounded-xl p-4 items-center justify-center"
          style={{ backgroundColor: getRiskColor(riskData.riskLevel) }}
        >
          <Text
            className="text-white text-lg font-bold"
            style={{ fontFamily: "Z06-Walone-Bold" }}
          >
            {riskData.riskLevel === "LOW"
              ? t("lowRisk")
              : riskData.riskLevel === "MODERATE"
              ? t("moderateRisk")
              : riskData.riskLevel === "HIGH"
              ? t("highRisk")
              : t("severeRisk")}{" "}
            {t("risk")}
          </Text>
        </Box>

        <Text
          className="text-gray-600 text-sm text-center"
          style={{ fontFamily: "Z06-Walone-Regular" }}
        >
          {t("basedOnForecast")}
        </Text>

        {/* Contributing Factors */}
        <VStack space="sm" className="mt-2">
          <HStack className="items-center justify-between">
            <Text
              className="text-gray-700 text-base font-medium"
              style={{ fontFamily: "Z06-Walone-Regular" }}
            >
              {t("groundWater")}:
            </Text>
            <Text
              className="text-gray-900 text-base font-semibold"
              style={{ fontFamily: "Z06-Walone-Bold" }}
            >
              {t("high")} ({riskData.soilSaturation}%)
            </Text>
          </HStack>
          <HStack className="items-center justify-between">
            <Text
              className="text-gray-700 text-base font-medium"
              style={{ fontFamily: "Z06-Walone-Regular" }}
            >
              {t("riverWater")}:
            </Text>
            <Text
              className="text-orange-600 text-base font-semibold"
              style={{ fontFamily: "Z06-Walone-Bold" }}
            >
              {riskData.riverLevels === "Normal"
                ? t("normal")
                : riskData.riverLevels === "Rising"
                ? t("rising")
                : t("high")}
            </Text>
          </HStack>
          <HStack className="items-center justify-between">
            <Text
              className="text-gray-700 text-base font-medium"
              style={{ fontFamily: "Z06-Walone-Regular" }}
            >
              {t("drainage")}:
            </Text>
            <Text
              className="text-orange-600 text-base font-semibold"
              style={{ fontFamily: "Z06-Walone-Bold" }}
            >
              {riskData.stormDrains === "Normal"
                ? t("normal")
                : riskData.stormDrains === "Near Capacity"
                ? t("nearCapacity")
                : t("atCapacity")}
            </Text>
          </HStack>
        </VStack>

        {/* Alert Box */}
        <Box className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mt-4">
          <HStack space="sm" className="items-start">
            <AlertCircle size={24} color="#F59E0B" />
            <VStack className="flex-1">
              <Text
                className="text-yellow-800 text-base font-semibold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {t("importantNotice")}
              </Text>
              <Text
                className="text-yellow-700 text-sm mt-1"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                {riskData.alertMessage || t("monitorConditions")}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
};

export default PrecipitationAnalysis;
