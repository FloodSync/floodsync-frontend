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
import { FloatingAssistantButton } from '@/components/FloatingAssistantButton';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [stylesReady, setStylesReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    requestAnimationFrame(() => {
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

  if (!loaded || !stylesReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [colorMode] = useState<"light" | "dark">("light");

  return (
     <FloatingAssistantButton>
    <GluestackUIProvider mode={colorMode}>
      <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </ThemeProvider>
    </GluestackUIProvider>
    </FloatingAssistantButton>
  );
}