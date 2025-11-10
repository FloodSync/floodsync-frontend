import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./ui/text";
import { Box } from "./ui/box";
import { HStack } from "./ui/hstack";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react-native";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "my" : "en");
  };

  return (
    <Pressable onPress={toggleLanguage}>
      <Box className="bg-blue-100 rounded-full px-3 py-2 flex-row items-center">
        <Languages size={16} color="#3B82F6" />
        <Text className="text-blue-700 text-sm font-semibold ml-2" style={{ fontFamily: "Z06-Walone-Regular" }}>
          {language === "en" ? "EN" : "MY"}
        </Text>
      </Box>
    </Pressable>
  );
}


