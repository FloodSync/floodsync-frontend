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

    notificationService.requestPermissions();

    notificationListenerRef.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        const data = response.notification.request.content.data;
        if (data?.type === "flood_alert") {
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

    if (floodRisk > 70) {
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
      lastNotifiedRiskRef.current = null;
    }
  }, [floodRisk, location, enabled, t]);
};
