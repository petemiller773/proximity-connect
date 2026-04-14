import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const subscribedRef = useRef(false);

  const sendLocalNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/pwa-192.png" });
    }
  }, []);

  // Request permission & store subscription on first login
  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window)) return;

    const setup = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch {
          // SW not critical — local notifications still work
        }
      }

      // Store subscription record (one per user)
      await supabase.from("push_subscriptions").upsert(
        { user_id: user.id, subscription: { type: "local" } } as any,
        { onConflict: "user_id" }
      );
    };

    setup();
  }, [user]);

  // Listen for realtime events and fire notifications
  useEffect(() => {
    if (!user || subscribedRef.current) return;
    subscribedRef.current = true;

    // Cache for display names to avoid repeated lookups
    const nameCache = new Map<string, string>();

    const getDisplayName = async (userId: string): Promise<string> => {
      if (nameCache.has(userId)) return nameCache.get(userId)!;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", userId)
        .single();
      const name = data?.display_name || "Someone";
      nameCache.set(userId, name);
      return name;
    };

    // 1. New connection requests (someone sent YOU a request)
    const connectionsChannel = supabase
      .channel("push-connections")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          sendLocalNotification(
            "New Connection Request",
            "Someone nearby wants to connect!"
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          const newStatus = (payload.new as any).status;
          if (newStatus === "accepted") {
            const name = await getDisplayName((payload.new as any).receiver_id);
            sendLocalNotification(
              "Connection Accepted!",
              `${name} accepted your connection!`
            );
          }
        }
      )
      .subscribe();

    // 2. New messages
    const messagesChannel = supabase
      .channel("push-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const senderId = (payload.new as any).sender_id;
          const name = await getDisplayName(senderId);
          sendLocalNotification("New Message", `${name} sent you a message`);
        }
      )
      .subscribe();

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, sendLocalNotification]);

  return { sendLocalNotification };
};
