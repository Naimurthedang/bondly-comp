import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type NotificationPermissionState = "default" | "granted" | "denied";

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermissionState>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  const isSupported = typeof Notification !== "undefined";

  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || Notification.permission !== "granted") return;
    
    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: options?.tag || "bondly-notification",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      // Auto-close after 8 seconds
      setTimeout(() => notification.close(), 8000);
    } catch (e) {
      // Fallback: some browsers don't support Notification constructor in certain contexts
      console.warn("[NOTIFY] Could not show notification:", e);
    }
  }, [isSupported]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user || permission !== "granted") return;

    const messageChannel = supabase
      .channel("notify-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as any;
        // Only notify for messages from others
        if (msg.sender_id === user.id) return;
        // Only notify when tab is not focused
        if (document.visibilityState === "visible") return;

        showNotification("New Message", {
          body: msg.content?.slice(0, 100) || "You have a new message",
          tag: `msg-${msg.booking_id}`,
          data: { url: `/messages?booking=${msg.booking_id}` },
        });
      })
      .subscribe();

    channelsRef.current.push(messageChannel);

    // Subscribe to booking status changes
    const bookingChannel = supabase
      .channel("notify-bookings")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "bookings",
      }, (payload) => {
        const booking = payload.new as any;
        const oldBooking = payload.old as any;

        // Only notify on status changes relevant to the user
        if (booking.status === oldBooking?.status) return;
        if (booking.parent_id !== user.id && booking.caregiver_id !== user.id) return;
        if (document.visibilityState === "visible") return;

        const statusMessages: Record<string, string> = {
          accepted: "Your booking has been accepted! 🎉",
          in_progress: "Your care session has started",
          completed: "Your care session is complete",
          cancelled: "A booking has been cancelled",
          disputed: "A booking dispute has been raised",
        };

        const body = statusMessages[booking.status] || `Booking status updated to ${booking.status}`;

        showNotification("Booking Update", {
          body,
          tag: `booking-${booking.id}`,
          data: { url: "/bookings" },
        });
      })
      .subscribe();

    channelsRef.current.push(bookingChannel);

    // Subscribe to safety incidents
    const safetyChannel = supabase
      .channel("notify-safety")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "safety_incidents",
      }, (payload) => {
        const incident = payload.new as any;

        showNotification("⚠️ Safety Alert", {
          body: `${incident.incident_type}: ${incident.description?.slice(0, 80) || "New safety incident reported"}`,
          tag: `safety-${incident.id}`,
          requireInteraction: true, // Don't auto-dismiss safety alerts
          data: { url: "/safety" },
        });
      })
      .subscribe();

    channelsRef.current.push(safetyChannel);

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [user, permission, showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
};
