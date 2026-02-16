import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const milestoneCategories = [
  { name: "Motor Skills", color: "bg-lavender", milestones: ["Rolling over", "Sitting up", "Crawling", "First steps", "Running", "Climbing"] },
  { name: "Language", color: "bg-sky", milestones: ["Cooing", "Babbling", "First word", "Two-word phrases", "Sentences", "Storytelling"] },
  { name: "Social", color: "bg-blush", milestones: ["Social smile", "Stranger anxiety", "Parallel play", "Sharing", "Empathy", "Friendships"] },
  { name: "Cognitive", color: "bg-sunshine", milestones: ["Object permanence", "Cause & effect", "Problem solving", "Counting", "Colors", "Reading readiness"] },
];

const MilestoneTracker = () => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));

  const totalMilestones = milestoneCategories.reduce((a, c) => a + c.milestones.length, 0);
  const totalCompleted = Object.values(completed).filter(Boolean).length;
  const overallProgress = totalMilestones > 0 ? (totalCompleted / totalMilestones) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 to-lavender/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-primary" />
              <h3 className="font-display font-bold text-foreground">Overall Progress</h3>
            </div>
            <Badge variant="secondary" className="font-display">
              {totalCompleted}/{totalMilestones}
            </Badge>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            <TrendingUp size={12} className="inline mr-1" />
            {Math.round(overallProgress)}% milestones reached
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestoneCategories.map((cat) => {
          const catCompleted = cat.milestones.filter((m) => completed[`${cat.name}-${m}`]).length;
          const catProgress = (catCompleted / cat.milestones.length) * 100;

          return (
            <Card key={cat.name} className="border-0 bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    {cat.name}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{catCompleted}/{cat.milestones.length}</span>
                </div>
                <Progress value={catProgress} className="h-1.5" />
              </CardHeader>
              <CardContent className="space-y-1">
                {cat.milestones.map((m) => {
                  const key = `${cat.name}-${m}`;
                  const done = completed[key];
                  return (
                    <motion.div key={key} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2 px-3 text-sm ${done ? "text-primary" : "text-muted-foreground"}`}
                        onClick={() => toggle(key)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${done ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                          {done && <Check size={12} className="text-primary-foreground" />}
                        </div>
                        {m}
                        {done && <Star size={14} className="ml-auto text-sunshine-foreground" />}
                      </Button>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTracker;
