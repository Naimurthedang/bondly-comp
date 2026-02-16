import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Cake, Plus, Gift } from "lucide-react";

interface Birthday {
  id: string;
  name: string;
  date: string;
}

const calculateAge = (dateStr: string) => {
  const today = new Date();
  const bd = new Date(dateStr);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
};

const daysUntil = (dateStr: string) => {
  const today = new Date();
  const bd = new Date(dateStr);
  bd.setFullYear(today.getFullYear());
  if (bd < today) bd.setFullYear(today.getFullYear() + 1);
  return Math.ceil((bd.getTime() - today.getTime()) / 86400000);
};

const BirthdayTracker = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const add = () => {
    if (!newName.trim() || !newDate) return;
    setBirthdays((prev) => [...prev, { id: crypto.randomUUID(), name: newName.trim(), date: newDate }]);
    setNewName("");
    setNewDate("");
    setShowAdd(false);
  };

  const sorted = [...birthdays].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cake size={20} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Birthday Tracker</h2>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full gap-2">
          <Plus size={14} /> Add
        </Button>
      </div>

      {showAdd && (
        <Card className="border-0">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <Button onClick={add} className="w-full rounded-xl">Save Birthday</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Gift size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Never forget a birthday again!</p>
          </div>
        )}
        {sorted.map((b) => {
          const days = daysUntil(b.date);
          const age = calculateAge(b.date);
          const isToday = days === 0 || days === 365;
          return (
            <Card key={b.id} className={`border-0 ${isToday ? "bg-sunshine/20" : ""}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isToday ? "🎂" : "🎁"}</span>
                  <div>
                    <p className="font-display font-bold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Age {age} · {new Date(b.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <Badge variant={isToday ? "default" : days <= 7 ? "secondary" : "outline"}>
                  {isToday ? "Today! 🎉" : `${days}d`}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BirthdayTracker;
