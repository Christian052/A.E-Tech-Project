import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync, triggerLocalServiceAlert } from "../utils/notifications";
import { useToast } from "./ToastContext";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  triggerServiceAlert: (title: string, body: string, data?: Record<string, any>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { showToast } = useToast();

  useEffect(() => {
    // 1. Register device for notifications
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) setExpoPushToken(token);
      })
      .catch((err) => {
        console.warn("[NotificationProvider] Registration notice:", err);
      });

    // 2. Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener((incoming) => {
      setNotification(incoming);
      const title = incoming.request.content.title;
      const body = incoming.request.content.body;
      if (title && body) {
        showToast(`🔔 ${title}: ${body}`, "info");
      }
    });

    // 3. User interaction listener (tap on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("[NotificationProvider] Notification tapped by user with payload:", data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const triggerServiceAlert = async (title: string, body: string, data: Record<string, any> = {}) => {
    try {
      await triggerLocalServiceAlert(title, body, data);
    } catch (e) {
      console.warn("[NotificationProvider] Failed to trigger local notification:", e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        triggerServiceAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
