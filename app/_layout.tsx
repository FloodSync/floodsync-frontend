// Import NativeWind setup FIRST - before any other imports
import "@/nativewind-setup";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { LanguageProvider } from "@/contexts/LanguageContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Z06-Walone-Thin": require("../assets/fonts/Z06 Walone/Z06-Walone Thin.ttf"),
    "Z06-Walone-Regular": require("../assets/fonts/Z06 Walone/Z06-Walone Regular.ttf"),
    "Z06-Walone-Bold": require("../assets/fonts/Z06 Walone/Z06-Walone Bold.ttf"),
    ...FontAwesome.font,
  });
  const [stylesReady, setStylesReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    requestAnimationFrame(() => {
      // Additional small delay to ensure NativeWind styles are fully processed
      setTimeout(() => {
        setStylesReady(true);
      }, 50);
    });
  }, []);

  useEffect(() => {
    if (loaded && stylesReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, stylesReady]);

  // Don't render until fonts and styles are ready
  if (!loaded || !stylesReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [colorMode] = useState<"light" | "dark">("light");

  return (
    <LanguageProvider>
      <GluestackUIProvider mode={colorMode}>
        <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
          <QueryClientProvider client={queryClient}>
            <Slot />
          </QueryClientProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </LanguageProvider>
  );
}
