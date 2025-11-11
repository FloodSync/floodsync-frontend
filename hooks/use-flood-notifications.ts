import { useEffect, useRef } from "react";
import { notificationService } from "@/lib/notifications/notification-service";
import * as Notifications from "expo-notifications";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseFloodNotificationsProps {
  floodRisk: number;
  location: string;
  enabled?: boolean;
}

export const useFloodNotifications = ({
  floodRisk,
  location,
  enabled = true,
}: UseFloodNotificationsProps) => {
  const { t } = useLanguage();
  const lastNotifiedRiskRef = useRef<number | null>(null);
  const notificationListenerRef =
    useRef<Notifications.EventSubscription | null>(null);
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(
    null
  );

  useEffect(() => {
    if (!enabled) return;

    // Request permissions on mount
    notificationService.requestPermissions();

    // Set up notification listeners
    notificationListenerRef.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification tap - could navigate to specific screen
        const data = response.notification.request.content.data;
        if (data?.type === "flood_alert") {
          // Could navigate to flood details or safety check
        }
      });

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
      }
      if (responseListenerRef.current) {
        responseListenerRef.current.remove();
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Only send notification when risk crosses 70% threshold
    if (floodRisk > 70) {
      // Check if we've already notified for this risk level
      if (lastNotifiedRiskRef.current !== floodRisk) {
        const title = t("floodAlertTitle");
        const body = t("floodAlertMessage")
          .replace("{risk}", floodRisk.toString())
          .replace("{location}", location);

        notificationService.scheduleFloodAlert(
          floodRisk,
          location,
          title,
          body
        );
        lastNotifiedRiskRef.current = floodRisk;
      }
    } else {
      // Reset when risk drops below 70%
      lastNotifiedRiskRef.current = null;
    }
  }, [floodRisk, location, enabled, t]);
};
