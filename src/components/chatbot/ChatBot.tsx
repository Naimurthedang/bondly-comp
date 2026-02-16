import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const { data } = await supabase.functions.invoke("chatbot-proxy", {
        body: { message: text, runId },
      });

      // Handle streaming SSE response
      if (typeof data === "string" && data.includes("data: ")) {
        const lines = data.split("\n").filter((l: string) => l.startsWith("data: "));
        let fullContent = "";
        for (const line of lines) {
          const payload = line.replace("data: ", "");
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.runId) setRunId(parsed.runId);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
              );
            }
          } catch { /* skip malformed */ }
        }
      } else if (data?.content) {
        if (data.runId) setRunId(data.runId);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: data.content } : m))
        );
      } else if (typeof data === "string") {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: data } : m))
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "Sorry, something went wrong. Please try again." } : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, runId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-primary/5">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-foreground">Bondly AI</h3>
          <p className="text-xs text-muted-foreground">Your parenting assistant</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-60">
            <Bot size={48} className="text-primary mb-4" />
            <p className="font-display font-bold text-foreground">Hi! I'm Bondly AI</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Ask me anything about parenting, milestones, activities, or family management.
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  )
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-blush flex items-center justify-center shrink-0 mt-1">
                  <User size={14} className="text-blush-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-border"
            rows={1}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="rounded-xl h-11 w-11 shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
