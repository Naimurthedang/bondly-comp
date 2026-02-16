import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  member: string;
  color: string;
}

const memberColors = ["bg-primary", "bg-blush", "bg-sky", "bg-mint", "bg-sunshine", "bg-lavender"];
const defaultMembers = ["Mom", "Dad", "Child 1"];

const FamilyCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMember, setNewMember] = useState(defaultMembers[0]);

  const addEvent = () => {
    if (!newTitle.trim() || !newDate) return;
    const colorIdx = defaultMembers.indexOf(newMember);
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        date: newDate,
        member: newMember,
        color: memberColors[colorIdx >= 0 ? colorIdx : 0],
      },
    ]);
    setNewTitle("");
    setNewDate("");
    setShowAdd(false);
  };

  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Family Calendar</h2>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full gap-2">
          <Plus size={14} /> Add Event
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="border-0">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Event title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                <div className="flex gap-2 flex-wrap">
                  {defaultMembers.map((m, i) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={newMember === m ? "default" : "outline"}
                      onClick={() => setNewMember(m)}
                      className="rounded-full text-xs"
                    >
                      {m}
                    </Button>
                  ))}
                </div>
                <Button onClick={addEvent} className="w-full rounded-xl">Add to Calendar</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Legend */}
      <div className="flex gap-2 flex-wrap">
        {defaultMembers.map((m, i) => (
          <Badge key={m} variant="outline" className="gap-1.5">
            <div className={`w-2 h-2 rounded-full ${memberColors[i]}`} />
            {m}
          </Badge>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-2">
        {sortedEvents.length === 0 && (
          <Card className="border-0">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No events yet. Add your first family event!</p>
            </CardContent>
          </Card>
        )}
        {sortedEvents.map((evt) => (
          <motion.div key={evt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-10 rounded-full ${evt.color}`} />
                  <div>
                    <p className="font-medium text-sm text-foreground">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evt.date).toLocaleDateString()} · {evt.member}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEvent(evt.id)}>
                  <Trash2 size={14} className="text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FamilyCalendar;
