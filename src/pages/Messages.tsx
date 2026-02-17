import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(searchParams.get("booking") || undefined);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, parent_id, caregiver_id, status")
        .or(`parent_id.eq.${user!.id},caregiver_id.eq.${user!.id}`)
        .in("status", ["accepted", "in_progress", "completed"]);
      if (error) throw error;
      return (bookings || []).map((b: any) => ({
        bookingId: b.id,
        otherName: b.parent_id === user!.id ? `Caregiver ${b.caregiver_id.slice(0, 8)}` : `Parent ${b.parent_id.slice(0, 8)}`,
        unreadCount: 0,
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft size={18} /></Button>
          <h1 className="font-display text-xl font-bold text-foreground">Messages</h1>
        </div>
      </header>
      <div className="flex-1 flex max-w-5xl mx-auto w-full">
        <aside className="w-72 border-r border-border shrink-0 hidden md:block">
          <ConversationList conversations={conversations} activeBookingId={activeBookingId} onSelect={setActiveBookingId} />
        </aside>
        <main className="flex-1 flex flex-col">
          {activeBookingId ? (
            <ChatWindow bookingId={activeBookingId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
