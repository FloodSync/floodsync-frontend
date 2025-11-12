import React, { useState, useEffect } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Pressable, Alert } from "react-native";
import { AlertCircle, X } from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { Motion, AnimatePresence } from "@legendapp/motion";
import { useAuthStore } from "@/stores/auth-store";
import { safetyApi } from "@/lib/api/safety";

interface FloodSafetyCheckProps {
  floodRisk: number;
  location?: string;
  onResponseSubmitted?: (isSafe: boolean) => void;
}

// Backend API endpoint configuration
// To configure: Set EXPO_PUBLIC_API_URL in your .env file or app.json
// Example: EXPO_PUBLIC_API_URL=https://your-api-domain.com
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.floodsync.com";

// Development mode: Set to true to show notification even if API fails (for testing)
const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === "true" || __DEV__;

const FloodSafetyCheck: React.FC<FloodSafetyCheckProps> = ({
  floodRisk,
  location = "Current Location",
  onResponseSubmitted,
}) => {
  const { t } = useLanguage();
  const { user, token, isAuthenticated } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedRisk, setHasCheckedRisk] = useState(false);
  const [lastRiskValue, setLastRiskValue] = useState(floodRisk);

  useEffect(() => {
    // Reset check state if risk drops below 80
    if (floodRisk <= 80 && hasCheckedRisk) {
      setHasCheckedRisk(false);
      setIsVisible(false);
    }

    // Check if flood risk is higher than 80 and we haven't checked yet
    if (floodRisk > 80 && !hasCheckedRisk) {
      checkSafetyStatus();
    }

    setLastRiskValue(floodRisk);
  }, [floodRisk, hasCheckedRisk, lastRiskValue]);

  const checkSafetyStatus = async () => {
    try {
      // Call backend API to check if we should show the safety check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/api/safety-status/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          floodRisk,
          location,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("Safety check response:", data);

      // Only show the notification if API call is successful
      setHasCheckedRisk(true);
      setIsVisible(true);
    } catch (error: any) {
      console.error("Error checking safety status:", error);

      // In development mode, show notification even if API fails (for testing)
      if (DEV_MODE) {
        console.warn(
          "DEV_MODE: Showing safety check notification despite API error"
        );
        setHasCheckedRisk(true);
        setIsVisible(true);
      } else {
        // In production, don't show notification if API call fails
        setHasCheckedRisk(true);
      }
    }
  };

  const submitSafetyStatus = async (isSafe: boolean) => {
    // Check if user is authenticated
    if (!isAuthenticated || !token || !user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to submit your safety status."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert boolean to API status format
      const status: "safe" | "not_safe" = isSafe ? "safe" : "not_safe";

      // Call the API
      const response = await safetyApi.submitSafetyStatus(
        token,
        user._id,
        status
      );

      console.log("Safety status submitted:", response);

      // Call the callback if provided
      if (onResponseSubmitted) {
        onResponseSubmitted(isSafe);
      }

      // Hide the notification after successful submission
      setIsVisible(false);
    } catch (error: any) {
      console.error("Error submitting safety status:", error);

      // In development mode, still hide notification and call callback (for testing)
      if (DEV_MODE) {
        console.warn(
          "DEV_MODE: Simulating successful submission despite API error"
        );
        if (onResponseSubmitted) {
          onResponseSubmitted(isSafe);
        }
        setIsVisible(false);
      } else {
        // Show error alert in production
        Alert.alert(
          "Error",
          error.message || "Failed to submit safety status. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSafe = () => {
    submitSafetyStatus(true);
  };

  const handleNotSafe = () => {
    submitSafetyStatus(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Motion.View
          initial={{
            opacity: 0,
            translateY: -100,
            scale: 0.95,
            translateX: 0,
            maxHeight: 0,
            marginBottom: 0,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
            translateX: 0,
            maxHeight: 500,
            marginBottom: 8,
          }}
          exit={{
            opacity: 0,
            translateX: 300,
            scale: 0.9,
            translateY: 0,
            maxHeight: 0,
            marginBottom: 0,
          }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 300,
            mass: 0.8,

            opacity: {
              type: "timing",
              duration: 250,
            },
            translateX: {
              type: "timing",
              duration: 300,
            },
            scale: {
              type: "timing",
              duration: 250,
            },
            maxHeight: {
              type: "spring",
              damping: 20,
              stiffness: 300,
            },
            marginBottom: {
              type: "timing",
              duration: 250,
            },
          }}
          style={{
            overflow: "hidden",
          }}
        >
          <Box className="mx-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <HStack space="sm" className="items-start mb-3">
              <AlertCircle size={24} color="#EF4444" />
              <VStack className="flex-1">
                <Text
                  className="text-red-800 font-semibold text-base"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("safetyCheckTitle")}
                </Text>
                <Text
                  className="text-red-700 text-sm mt-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("safetyCheckMessage")}
                </Text>
              </VStack>
              <Pressable onPress={handleClose}>
                <X size={20} color="#EF4444" />
              </Pressable>
            </HStack>

            <Box className="bg-white rounded-lg p-3 mb-3">
              <Text
                className="text-gray-700 text-xs"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                <Text
                  className="font-semibold"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("floodRiskLevel")}:
                </Text>{" "}
                {floodRisk}% | {location}
              </Text>
            </Box>

            <HStack space="sm">
              <Button
                action="negative"
                onPress={handleNotSafe}
                disabled={isSubmitting}
                className="flex-1"
              >
                <ButtonText style={{ fontFamily: "Z06-Walone-Bold" }}>
                  {t("notSafe")}
                </ButtonText>
              </Button>
              <Button
                action="positive"
                onPress={handleSafe}
                disabled={isSubmitting}
                className="flex-1"
              >
                <ButtonText style={{ fontFamily: "Z06-Walone-Bold" }}>
                  {t("safe")}
                </ButtonText>
              </Button>
            </HStack>
          </Box>
        </Motion.View>
      )}
    </AnimatePresence>
  );
};

export default FloodSafetyCheck;
