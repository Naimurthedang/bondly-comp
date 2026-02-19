import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Utensils, Moon, Activity, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface WellbeingReportFormProps {
  bookingId: string;
  childId?: string;
  onSubmitted?: () => void;
}

const moodLabels = ["😢 Very Upset", "😟 Upset", "😐 Okay", "😊 Happy", "😄 Very Happy"];

const WellbeingReportForm = ({ bookingId, childId, onSubmitted }: WellbeingReportFormProps) => {
  const [mood, setMood] = useState(3);
  const [careNotes, setCareNotes] = useState("");
  const [meals, setMeals] = useState([{ time: "", description: "" }]);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [activities, setActivities] = useState([{ name: "", duration: "" }]);
  const [incidents, setIncidents] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("safety-monitor", {
        body: {
          action: "wellbeing_report",
          booking_id: bookingId,
          child_id: childId,
          mood_rating: mood,
          care_notes: careNotes,
          meals_log: meals.filter(m => m.description),
          sleep_log: sleepStart ? { start: sleepStart, end: sleepEnd } : {},
          activities: activities.filter(a => a.name),
          incidents: incidents || null,
        },
      });
      if (error) throw error;

      if (data.report?.ai_generated_summary) {
        setAiSummary(data.report.ai_generated_summary);
      }
      toast.success("Wellbeing report submitted!");
      onSubmitted?.();
    } catch (e: any) {
      toast.error("Failed to submit: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <FileText size={18} className="text-primary" /> Post-Session Wellbeing Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Heart size={14} /> Child's Mood
          </label>
          <div className="flex gap-2">
            {moodLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setMood(i + 1)}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                  mood === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Care Notes */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Care Notes</label>
          <Textarea
            value={careNotes}
            onChange={(e) => setCareNotes(e.target.value)}
            placeholder="How was the session? Any observations..."
            rows={3}
          />
        </div>

        {/* Meals */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Utensils size={14} /> Meals
          </label>
          {meals.map((meal, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                type="time"
                value={meal.time}
                onChange={(e) => {
                  const m = [...meals]; m[i].time = e.target.value; setMeals(m);
                }}
                className="w-32"
              />
              <Input
                placeholder="What they ate..."
                value={meal.description}
                onChange={(e) => {
                  const m = [...meals]; m[i].description = e.target.value; setMeals(m);
                }}
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setMeals([...meals, { time: "", description: "" }])}>
            + Add meal
          </Button>
        </div>

        {/* Sleep */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Moon size={14} /> Nap / Sleep
          </label>
          <div className="flex gap-2">
            <Input type="time" placeholder="Start" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
            <Input type="time" placeholder="End" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
          </div>
        </div>

        {/* Activities */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Activity size={14} /> Activities
          </label>
          {activities.map((act, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                placeholder="Activity name"
                value={act.name}
                onChange={(e) => {
                  const a = [...activities]; a[i].name = e.target.value; setActivities(a);
                }}
              />
              <Input
                placeholder="Duration"
                value={act.duration}
                onChange={(e) => {
                  const a = [...activities]; a[i].duration = e.target.value; setActivities(a);
                }}
                className="w-28"
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setActivities([...activities, { name: "", duration: "" }])}>
            + Add activity
          </Button>
        </div>

        {/* Incidents */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Incidents (if any)</label>
          <Textarea
            value={incidents}
            onChange={(e) => setIncidents(e.target.value)}
            placeholder="Report any incidents or concerns..."
            rows={2}
          />
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit Report"}
        </Button>

        {aiSummary && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm font-medium text-primary flex items-center gap-2 mb-2">
              <Sparkles size={14} /> AI Summary for Parent
            </p>
            <p className="text-sm text-foreground">{aiSummary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellbeingReportForm;
