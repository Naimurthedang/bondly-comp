import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Updates the user's online presence and last_seen_at timestamp */
export const usePresence = () => {
  const { user } = useAuth();

  const updatePresence = useCallback(async (online: boolean) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ is_online: online, last_seen_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    updatePresence(true);

    const interval = setInterval(() => updatePresence(true), 60_000);

    const handleVisibility = () => {
      updatePresence(document.visibilityState === "visible");
    };

    const handleBeforeUnload = () => updatePresence(false);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updatePresence(false);
    };
  }, [user, updatePresence]);
};
