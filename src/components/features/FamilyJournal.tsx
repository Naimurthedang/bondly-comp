import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Heart, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood: string;
}

const moods = ["😊", "😍", "🥳", "😴", "🤔", "😢"];

const FamilyJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");

  const addEntry = () => {
    if (!content.trim()) return;
    setEntries((prev) => [
      { id: crypto.randomUUID(), title: title.trim() || "Untitled", content: content.trim(), date: new Date(), mood },
      ...prev,
    ]);
    setTitle("");
    setContent("");
    setMood("😊");
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Family Journal</h2>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full gap-2">
          <Plus size={14} /> New Entry
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="border-0">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Write about today..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mood:</span>
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`text-xl p-1 rounded-lg transition-all ${mood === m ? "bg-primary/10 scale-125" : "opacity-50 hover:opacity-100"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Button onClick={addEntry} className="w-full rounded-xl">Save Memory</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Heart size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Start capturing family memories</p>
          </div>
        )}
        {entries.map((entry) => (
          <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-foreground">{entry.mood} {entry.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {entry.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FamilyJournal;
