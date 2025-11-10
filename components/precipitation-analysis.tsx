import React from "react";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import { AlertCircle, Droplet, TrendingUp } from "lucide-react-native";
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

  // Mock data - will be replaced with actual data from props
  const precipData: PrecipitationData = {
    lastHour: precipitation?.lastHour ?? 0.4,
    last24Hours: precipitation?.last24Hours ?? 2.3,
    next24HoursForecast: precipitation?.next24HoursForecast ?? 4.5,
  };

  const riskData: FloodRiskData = {
    riskLevel: floodRisk?.riskLevel ?? "MODERATE",
    soilSaturation: floodRisk?.soilSaturation ?? 85,
    riverLevels: floodRisk?.riverLevels ?? "Rising",
    stormDrains: floodRisk?.stormDrains ?? "Near Capacity",
    alertMessage:
      floodRisk?.alertMessage ??
      "Monitor conditions closely. Avoid low-lying areas and be prepared for possible evacuation.",
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

  const getRainfallIntensity = (inches: number) => {
    if (inches < 2.5)
      return { label: "Light", color: "#D1FAE5", textColor: "#065F46" };
    if (inches <= 5)
      return { label: "Moderate", color: "#FEF3C7", textColor: "#92400E" };
    return { label: "Heavy", color: "#FCE7F3", textColor: "#9F1239" };
  };

  const getMaxPrecipitation = () => {
    return Math.max(
      precipData.lastHour,
      precipData.last24Hours,
      precipData.next24HoursForecast
    );
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
                {precipData.lastHour} {t("inches")}
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
                {precipData.last24Hours} {t("inches")}
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
                className="text-orange-600 text-base font-bold"
                style={{ fontFamily: "Z06-Walone-Bold" }}
              >
                {precipData.next24HoursForecast} {t("inches")}
              </Text>
            </HStack>
            <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <Box
                className="h-full bg-orange-500 rounded-full"
                style={{
                  width: `${
                    (precipData.next24HoursForecast / maxPrecip) * 100
                  }%`,
                }}
              />
            </Box>
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
              {t("lessThan")} 2.5 {t("inches")}
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
              2.5 {t("to")} 5 {t("inches")}
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
              {t("moreThan")} 5 {t("inches")}
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
