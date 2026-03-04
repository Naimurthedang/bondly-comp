import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useRateLimit } from "@/hooks/useRateLimit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
}

interface ChatWindowProps {
  bookingId: string;
}

const TypingDots = () => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 5 }}
    className="flex items-center gap-1 px-4 py-2"
  >
    <span className="text-xs text-muted-foreground italic">typing</span>
    <div className="flex gap-0.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);

const ChatWindow = ({ bookingId }: ChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { othersTyping, handleTyping, setTyping } = useTypingIndicator(bookingId);
  const { checkLimit } = useRateLimit({ maxRequests: 30, windowMs: 60_000 });

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, othersTyping]);

  // Mark messages as read
  useEffect(() => {
    if (!user || messages.length === 0) return;
    const unread = messages.filter(m => m.sender_id !== user.id && !m.read_at);
    if (unread.length === 0) return;
    
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread.map(m => m.id))
      .then(() => {
        setMessages(prev => prev.map(m => 
          unread.some(u => u.id === m.id) ? { ...m, read_at: new Date().toISOString() } : m
        ));
      });
  }, [messages, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    if (!checkLimit()) return;
    
    setSending(true);
    setTyping(false);
    await supabase.from("messages").insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              content={m.content}
              isOwn={m.sender_id === user?.id}
              createdAt={m.created_at}
              readAt={m.read_at}
              messageType={m.message_type}
            />
          ))}
          <AnimatePresence>
            {othersTyping.length > 0 && <TypingDots />}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()}>
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
