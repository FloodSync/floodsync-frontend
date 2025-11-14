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
    // Reset check state if risk drops below 70
    if (floodRisk < 70 && hasCheckedRisk) {
      setHasCheckedRisk(false);
      setIsVisible(false);
    }

    // Show safety check when flood risk is >= 70 and user is authenticated
    if (floodRisk >= 70 && !hasCheckedRisk && isAuthenticated && user) {
      setHasCheckedRisk(true);
      setIsVisible(true);
    }

    setLastRiskValue(floodRisk);
  }, [floodRisk, hasCheckedRisk, lastRiskValue, isAuthenticated, user]);

  const submitSafetyStatus = async (isSafe: boolean) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user || !token) {
      Alert.alert(
        "Authentication Required",
        "Please login to submit your safety status."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the API to submit safety status
      const response = await safetyApi.submitSafetyStatus(
        token,
        user._id,
        isSafe
      );

      console.log("Safety status submitted successfully:", response);

      // Call the callback if provided
      if (onResponseSubmitted) {
        onResponseSubmitted(isSafe);
      }

      // Show success message
      Alert.alert(
        "Success",
        `Your safety status has been recorded as: ${
          isSafe ? "Safe" : "Not Safe"
        }`
      );

      // Hide the notification after successful submission
      setIsVisible(false);
    } catch (error: any) {
      console.error("Error submitting safety status:", error);

      // Show error message to user
      Alert.alert(
        "Error",
        error.message || "Failed to submit safety status. Please try again."
      );
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
