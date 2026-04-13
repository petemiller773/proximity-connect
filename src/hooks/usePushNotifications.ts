import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Register a minimal service worker for push
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: undefined, // Web push without VAPID for now - uses local notifications
        });

        // Store subscription
        await supabase.from("push_subscriptions").upsert(
          {
            user_id: user.id,
            subscription: subscription.toJSON(),
          } as any,
          { onConflict: "user_id" }
        );
      } catch {
        // Fallback: just use local Notification API
        console.log("Push subscription not available, using local notifications");
      }
    };

    requestPermission();
  }, [user]);

  const sendLocalNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  return { sendLocalNotification };
};
