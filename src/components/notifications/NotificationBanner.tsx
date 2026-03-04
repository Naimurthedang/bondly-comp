import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff, BellRing, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const NotificationBanner = () => {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <Card className="border-primary/20 shadow-lg bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BellRing size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Enable notifications</p>
              <p className="text-xs text-muted-foreground">Get alerts for messages and booking updates</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setDismissed(true)}
              >
                <X size={14} />
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
                onClick={requestPermission}
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

/** Small bell icon button for header/nav showing notification status */
export const NotificationToggle = ({ className }: { className?: string }) => {
  const { isSupported, permission, requestPermission } = useNotifications();

  if (!isSupported) return null;

  const Icon = permission === "granted" ? Bell : permission === "denied" ? BellOff : BellRing;
  const label = permission === "granted" ? "Notifications on" : permission === "denied" ? "Notifications blocked" : "Enable notifications";

  return (
    <button
      onClick={() => {
        if (permission === "default") requestPermission();
      }}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-full transition-colors",
        permission === "granted"
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      title={label}
      disabled={permission === "denied"}
    >
      <Icon size={18} />
      {permission === "granted" && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
      )}
    </button>
  );
};
