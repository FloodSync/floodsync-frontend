import React, { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Package, X, Check } from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { Motion, AnimatePresence } from "@legendapp/motion";
import { useAuthStore } from "@/stores/auth-store";
import { resourcesApi, ResourceType, SupplyCategory } from "@/lib/api/resources";
import { Button, ButtonText } from "@/components/ui/button";

interface ResourceSurveyProps {
  floodRisk: number;
  location?: string;
  onResourcesSubmitted?: (resources: ResourceType[]) => void;
}

// Map category names to translation keys
const getTranslationKey = (category: string): string => {
  const mapping: { [key: string]: string } = {
    "medical kit": "medicalKit",
    "food and water": "foodAndWater",
    shelter: "shelter",
    clothing: "clothing",
    "hygiene items": "hygieneItems",
    "baby care": "babyCare",
    "power and lighting": "powerAndLighting",
    "safety and rescue gear": "safetyAndRescueGear",
  };
  return mapping[category.toLowerCase()] || category;
};

const ResourceSurvey: React.FC<ResourceSurveyProps> = ({
  floodRisk,
  location = "Current Location",
  onResourcesSubmitted,
}) => {
  const { t } = useLanguage();
  const { user, token, isAuthenticated } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResources, setSelectedResources] = useState<ResourceType[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from API - fetch immediately when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await resourcesApi.getSupplyCategories();
        console.log("Supply categories loaded from API:", categoriesData);
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          // Fallback if empty
          setCategories([
            { category: "medical kit" },
            { category: "food and water" },
            { category: "shelter" },
            { category: "clothing" },
            { category: "hygiene items" },
            { category: "baby care" },
            { category: "power and lighting" },
            { category: "safety and rescue gear" },
          ]);
        }
      } catch (error: any) {
        console.error("Error fetching supply categories:", error);
        // Fallback to default categories if API fails
        setCategories([
          { category: "medical kit" },
          { category: "food and water" },
          { category: "shelter" },
          { category: "clothing" },
          { category: "hygiene items" },
          { category: "baby care" },
          { category: "power and lighting" },
          { category: "safety and rescue gear" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    // Fetch categories immediately, don't wait for authentication
    fetchCategories();
  }, []);

  useEffect(() => {
    // Show survey when flood risk is >= 70 and user is authenticated
    // Show even if categories are loading (will show loading state)
    if (floodRisk >= 70 && isAuthenticated && user && !hasSubmitted) {
      setIsVisible(true);
    } else if (floodRisk < 70) {
      setIsVisible(false);
      setSelectedResources([]);
      setHasSubmitted(false);
    }
  }, [floodRisk, isAuthenticated, user, hasSubmitted]);

  const toggleResource = (resource: ResourceType) => {
    setSelectedResources((prev) => {
      if (prev.includes(resource)) {
        return prev.filter((r) => r !== resource);
      } else {
        return [...prev, resource];
      }
    });
  };

  const submitResources = async () => {
    if (selectedResources.length === 0) {
      Alert.alert("Error", t("selectAtLeastOne"));
      return;
    }

    if (!isAuthenticated || !user || !token) {
      Alert.alert(
        "Authentication Required",
        "Please login to submit your resource needs."
      );
      return;
    }

    // Validate user has city and township
    if (!user.city || !user.township) {
      Alert.alert(
        "Location Required",
        "Please update your profile with city and township information."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resourcesApi.submitSupplySurvey(
        token,
        user._id,
        user.city,
        user.township,
        selectedResources
      );

      console.log("Supply survey submitted successfully:", response);

      if (onResourcesSubmitted) {
        onResourcesSubmitted(selectedResources);
      }

      Alert.alert("Success", t("resourcesSubmitted"));
      setHasSubmitted(true);
      setIsVisible(false);
    } catch (error: any) {
      console.error("Error submitting supply survey:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit resource needs. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            translateY: -100,
            scale: 0.9,
          }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 300,
            mass: 0.8,
          }}
        >
          <Box className="mx-4 mb-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
            <HStack space="sm" className="items-start mb-3">
              <Package size={24} color="#3B82F6" />
              <VStack className="flex-1">
                <Text
                  className="text-blue-800 font-semibold text-base"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("resourceSurveyTitle")}
                </Text>
                <Text
                  className="text-blue-700 text-sm mt-1"
                  style={{ fontFamily: "Z06-Walone-Regular" }}
                >
                  {t("resourceSurveyMessage")}
                </Text>
              </VStack>
              <Pressable onPress={handleClose}>
                <X size={20} color="#3B82F6" />
              </Pressable>
            </HStack>

            <Box className="bg-white rounded-lg p-3 mb-3">
              <Text
                className="text-gray-700 text-xs mb-2"
                style={{ fontFamily: "Z06-Walone-Regular" }}
              >
                <Text
                  className="font-semibold"
                  style={{ fontFamily: "Z06-Walone-Bold" }}
                >
                  {t("resourceSurveySubtitle")}
                </Text>
              </Text>
              <Box style={{ height: 300 }}>
                <ScrollView 
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 8 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={true}
                  keyboardShouldPersistTaps="handled"
                >
                {loadingCategories ? (
                  <Box className="items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text
                      className="text-gray-600 text-sm mt-2"
                      style={{ fontFamily: "Z06-Walone-Regular" }}
                    >
                      {t("loading")}
                    </Text>
                  </Box>
                ) : categories.length === 0 ? (
                  <Box className="items-center justify-center py-8">
                    <Text
                      className="text-gray-500 text-sm"
                      style={{ fontFamily: "Z06-Walone-Regular" }}
                    >
                      {t("noCategoriesAvailable") || "No categories available"}
                    </Text>
                  </Box>
                ) : (
                  <VStack space="sm">
                    {categories.map((category) => {
                      const categoryName = category.category;
                      const isSelected = selectedResources.includes(categoryName);
                      const translationKey = getTranslationKey(categoryName);
                      
                      return (
                        <Pressable
                          key={categoryName}
                          onPress={() => toggleResource(categoryName)}
                        >
                          <Box
                            className={`flex-row items-center p-3 rounded-lg border-2 ${
                              isSelected
                                ? "bg-blue-100 border-blue-500"
                                : "bg-gray-50 border-gray-300"
                            }`}
                          >
                            <Box
                              className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {isSelected && (
                                <Check size={14} color="white" />
                              )}
                            </Box>
                            <Text
                              className={`flex-1 ${
                                isSelected
                                  ? "text-blue-800 font-semibold"
                                  : "text-gray-700"
                              }`}
                              style={{
                                fontFamily: isSelected
                                  ? "Z06-Walone-Bold"
                                  : "Z06-Walone-Regular",
                              }}
                            >
                              {t(translationKey) || categoryName}
                            </Text>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </VStack>
                )}
                </ScrollView>
              </Box>
            </Box>

            <Button
              action="primary"
              onPress={submitResources}
              disabled={isSubmitting || selectedResources.length === 0}
              className="w-full"
            >
              <ButtonText style={{ fontFamily: "Z06-Walone-Bold" }}>
                {isSubmitting ? t("loading") : t("submitResources")}
              </ButtonText>
            </Button>
          </Box>
        </Motion.View>
      )}
    </AnimatePresence>
  );
};

export default ResourceSurvey;

