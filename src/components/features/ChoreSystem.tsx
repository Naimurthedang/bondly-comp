import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Plus, Star, Award, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface Chore {
  id: string;
  title: string;
  assignee: string;
  points: number;
  completed: boolean;
}

interface FamilyMember {
  name: string;
  totalPoints: number;
  allowance: number;
}

const ChoreSystem = () => {
  const [chores, setChores] = useState<Chore[]>([
    { id: "1", title: "Make bed", assignee: "Child 1", points: 5, completed: false },
    { id: "2", title: "Wash dishes", assignee: "Child 1", points: 10, completed: false },
    { id: "3", title: "Clean room", assignee: "Child 1", points: 15, completed: false },
    { id: "4", title: "Feed pet", assignee: "Child 1", points: 5, completed: false },
    { id: "5", title: "Take out trash", assignee: "Child 1", points: 10, completed: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState("5");

  const toggleChore = (id: string) =>
    setChores((prev) => prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)));

  const addChore = () => {
    if (!newTitle.trim()) return;
    setChores((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newTitle.trim(), assignee: "Child 1", points: parseInt(newPoints) || 5, completed: false },
    ]);
    setNewTitle("");
    setNewPoints("5");
    setShowAdd(false);
  };

  const completedPoints = chores.filter((c) => c.completed).reduce((a, c) => a + c.points, 0);
  const totalPoints = chores.reduce((a, c) => a + c.points, 0);
  const progress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <Card className="border-0 bg-gradient-to-r from-sunshine/30 to-mint/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-sunshine-foreground" />
              <h3 className="font-display font-bold text-foreground">Points Earned</h3>
            </div>
            <div className="flex items-center gap-1">
              <Coins size={16} className="text-sunshine-foreground" />
              <span className="font-display font-bold text-lg">{completedPoints}</span>
              <span className="text-muted-foreground text-sm">/ {totalPoints}</span>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Chore List */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground">Today's Chores</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="rounded-full gap-2">
          <Plus size={14} /> Add
        </Button>
      </div>

      {showAdd && (
        <Card className="border-0">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Chore name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <div className="flex gap-2 items-center">
              <Star size={14} className="text-sunshine-foreground" />
              <Input type="number" placeholder="Points" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} className="w-24" />
              <span className="text-sm text-muted-foreground">points</span>
            </div>
            <Button onClick={addChore} className="w-full rounded-xl">Add Chore</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {chores.map((chore) => (
          <motion.div key={chore.id} whileTap={{ scale: 0.98 }}>
            <Card className={`border-0 cursor-pointer transition-all ${chore.completed ? "opacity-60" : ""}`} onClick={() => toggleChore(chore.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    chore.completed ? "bg-primary border-primary" : "border-muted-foreground/30"
                  }`}>
                    {chore.completed && <Check size={14} className="text-primary-foreground" />}
                  </div>
                  <span className={`text-sm font-medium ${chore.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {chore.title}
                  </span>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Star size={10} /> {chore.points}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reward Tiers */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Star size={16} className="text-sunshine-foreground" /> Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Extra screen time (30 min)", cost: 20 },
            { name: "Pick dinner tonight", cost: 30 },
            { name: "New toy / book", cost: 100 },
            { name: "Family outing choice", cost: 150 },
          ].map((reward) => (
            <div key={reward.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm">{reward.name}</span>
              <Badge variant={completedPoints >= reward.cost ? "default" : "outline"} className="gap-1">
                <Coins size={10} /> {reward.cost}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChoreSystem;
