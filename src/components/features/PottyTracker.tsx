import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, Trophy, PartyPopper, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PottyEntry {
  id: string;
  type: "success" | "attempt" | "accident";
  time: Date;
}

const PottyTracker = () => {
  const [entries, setEntries] = useState<PottyEntry[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);

  const addEntry = (type: PottyEntry["type"]) => {
    const entry: PottyEntry = { id: crypto.randomUUID(), type, time: new Date() };
    setEntries((prev) => [entry, ...prev]);
    if (type === "success") {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const successes = entries.filter((e) => e.type === "success").length;
  const attempts = entries.filter((e) => e.type === "attempt").length;
  const accidents = entries.filter((e) => e.type === "accident").length;
  const total = entries.length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.6 }}>
                <PartyPopper size={80} className="text-sunshine mx-auto mb-4" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-foreground">🎉 Great Job!</h2>
              <p className="text-muted-foreground mt-2">Another successful potty trip!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Log Buttons */}
      <Card className="border-0 bg-gradient-to-r from-mint/30 to-sky/30">
        <CardHeader>
          <CardTitle className="font-display text-lg">Quick Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => addEntry("success")} className="h-20 flex-col gap-2 bg-mint hover:bg-mint/80 text-mint-foreground rounded-xl">
              <Check size={24} />
              <span className="text-xs font-medium">Success!</span>
            </Button>
            <Button onClick={() => addEntry("attempt")} variant="outline" className="h-20 flex-col gap-2 rounded-xl">
              <Clock size={24} />
              <span className="text-xs font-medium">Attempt</span>
            </Button>
            <Button onClick={() => addEntry("accident")} variant="outline" className="h-20 flex-col gap-2 rounded-xl border-destructive/30 text-destructive">
              <X size={24} />
              <span className="text-xs font-medium">Accident</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timer Reminder */}
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer size={20} className="text-primary" />
              <div>
                <p className="font-display font-bold text-sm">Potty Reminder</p>
                <p className="text-xs text-muted-foreground">Every {reminderMinutes} minutes</p>
              </div>
            </div>
            <Button
              variant={reminderActive ? "default" : "outline"}
              size="sm"
              onClick={() => setReminderActive(!reminderActive)}
              className="rounded-full"
            >
              {reminderActive ? "Active" : "Start"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 text-center">
          <CardContent className="p-4">
            <p className="font-display text-2xl font-bold text-mint-foreground">{successes}</p>
            <p className="text-xs text-muted-foreground">Successes</p>
          </CardContent>
        </Card>
        <Card className="border-0 text-center">
          <CardContent className="p-4">
            <p className="font-display text-2xl font-bold text-foreground">{attempts}</p>
            <p className="text-xs text-muted-foreground">Attempts</p>
          </CardContent>
        </Card>
        <Card className="border-0 text-center">
          <CardContent className="p-4">
            <p className="font-display text-2xl font-bold text-destructive">{accidents}</p>
            <p className="text-xs text-muted-foreground">Accidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart (simplified) */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Trophy size={16} className="text-primary" /> Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={successRate} className="h-4 mb-2" />
          <p className="text-sm text-muted-foreground">{Math.round(successRate)}% success rate</p>
        </CardContent>
      </Card>

      {/* Recent Log */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="font-display text-base">Recent Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No entries yet. Start logging!</p>
          )}
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant={entry.type === "success" ? "default" : "outline"}
                  className={entry.type === "accident" ? "border-destructive text-destructive" : ""}
                >
                  {entry.type}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {entry.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PottyTracker;
