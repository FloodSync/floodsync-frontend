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
import { useAuthStore } from "@/stores/auth-store";
import { notificationService } from "@/lib/notifications/notification-service";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";

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
  const { token, isAuthenticated } = useAuthStore();

  // Register for push notifications (works with or without authentication)
  useEffect(() => {
    const registerPushNotifications = async () => {
      try {
        // Register push token - pass auth token if available, otherwise register anonymously
        await notificationService.registerForPushNotifications(
          isAuthenticated && token ? token : undefined
        );
      } catch (error) {
        console.error("Failed to register push notifications:", error);
      }
    };

    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      registerPushNotifications();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, token]);

  // Re-register push token when auth state changes (to link/unlink from user account)
  useEffect(() => {
    const reRegisterPushToken = async () => {
      // Get existing token if any
      const existingToken = notificationService.getRegisteredToken();

      if (existingToken) {
        // Re-register with new auth state (authenticated or unauthenticated)
        try {
          await notificationService.registerForPushNotifications(
            isAuthenticated && token ? token : undefined
          );
        } catch (error) {
          console.error("Failed to re-register push token:", error);
        }
      }
    };

    // Re-register when auth state changes (but only after initial registration)
    const timer = setTimeout(() => {
      reRegisterPushToken();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, token]);

  return (
    <LanguageProvider>
      <FloatingAssistantButton>
        <GluestackUIProvider mode={colorMode}>
          <ThemeProvider
            value={colorMode === "dark" ? DarkTheme : DefaultTheme}
          >
            <QueryClientProvider client={queryClient}>
              <Slot />
            </QueryClientProvider>
          </ThemeProvider>
        </GluestackUIProvider>
      </FloatingAssistantButton>
    </LanguageProvider>
  );
}
