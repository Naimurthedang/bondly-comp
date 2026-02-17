import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  createdAt: string;
  readAt?: string | null;
  messageType?: string;
}

const MessageBubble = ({ content, isOwn, createdAt, readAt, messageType }: MessageBubbleProps) => (
  <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
    <div className={cn(
      "max-w-[75%] rounded-2xl px-4 py-2.5",
      isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
      messageType === "system" && "bg-muted/50 text-muted-foreground italic text-center max-w-full"
    )}>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
      <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
        <span className={cn("text-[10px]", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
          {format(new Date(createdAt), "h:mm a")}
        </span>
        {isOwn && (readAt ? <CheckCheck size={12} className="text-primary-foreground/60" /> : <Check size={12} className="text-primary-foreground/40" />)}
      </div>
    </div>
  </div>
);

export default MessageBubble;
