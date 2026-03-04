import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useTypingIndicator = (bookingId: string) => {
  const { user } = useAuth();
  const [othersTyping, setOthersTyping] = useState<string[]>([]);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Listen for others typing
  useEffect(() => {
    const channel = supabase
      .channel(`typing-${bookingId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "typing_status",
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        const record = payload.new as any;
        if (record && record.user_id !== user?.id) {
          setOthersTyping(prev => {
            if (record.is_typing && !prev.includes(record.user_id)) {
              return [...prev, record.user_id];
            }
            if (!record.is_typing) {
              return prev.filter(id => id !== record.user_id);
            }
            return prev;
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId, user?.id]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!user) return;
    
    // Upsert typing status
    await supabase.from("typing_status").upsert({
      booking_id: bookingId,
      user_id: user.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: "booking_id,user_id" }).select();
  }, [bookingId, user]);

  const handleTyping = useCallback(() => {
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 3000);
  }, [setTyping]);

  return { othersTyping, handleTyping, setTyping };
};
