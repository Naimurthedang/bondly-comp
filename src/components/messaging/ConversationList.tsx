import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";

interface Conversation {
  bookingId: string;
  otherName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeBookingId?: string;
  onSelect: (bookingId: string) => void;
}

const ConversationList = ({ conversations, activeBookingId, onSelect }: ConversationListProps) => (
  <ScrollArea className="h-full">
    <div className="space-y-1 p-2">
      {conversations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No conversations yet</p>
        </div>
      )}
      {conversations.map((c) => (
        <button
          key={c.bookingId}
          onClick={() => onSelect(c.bookingId)}
          className={cn(
            "w-full text-left rounded-xl p-3 transition-colors",
            activeBookingId === c.bookingId ? "bg-primary/10" : "hover:bg-muted"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-foreground truncate">{c.otherName}</span>
            {c.lastMessageTime && (
              <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(c.lastMessageTime), "MMM d")}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate">{c.lastMessage || "No messages yet"}</p>
            {c.unreadCount > 0 && (
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{c.unreadCount}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  </ScrollArea>
);

export default ConversationList;
