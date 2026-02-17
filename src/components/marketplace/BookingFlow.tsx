import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BookingFlowProps {
  caregiverId: string;
  caregiverName: string;
  hourlyRate: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingFlow = ({ caregiverId, caregiverName, hourlyRate, onClose, onSuccess }: BookingFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const hours = date && startTime && endTime
    ? Math.max(0, (new Date(`${date}T${endTime}`).getTime() - new Date(`${date}T${startTime}`).getTime()) / 3600000)
    : 0;
  const total = hours * hourlyRate;

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      parent_id: user.id,
      caregiver_id: caregiverId,
      start_time: `${date}T${startTime}:00`,
      end_time: `${date}T${endTime}:00`,
      hourly_rate: hourlyRate,
      total_amount: total,
      notes: notes.trim() || null,
    });
    setLoading(false);
    if (error) { toast.error("Failed to create booking"); return; }
    toast.success("Booking request sent!");
    setStep(3);
    onSuccess();
  };

  if (step === 3) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-primary" />
          <h3 className="font-display text-xl font-bold text-foreground">Booking Requested!</h3>
          <p className="text-muted-foreground">Your request has been sent to {caregiverName}. You'll be notified when they respond.</p>
          <Button onClick={onClose}>Done</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="font-display">Book {caregiverName}</CardTitle>
        <p className="text-sm text-muted-foreground">Step {step} of 2</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar size={14} /> Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Clock size={14} /> Start</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <Textarea placeholder="Any notes or special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button className="w-full" disabled={!date || !startTime || !endTime || hours <= 0} onClick={() => setStep(2)}>
              Continue
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="text-foreground font-medium">{date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="text-foreground font-medium">{startTime} – {endTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="text-foreground font-medium">{hours.toFixed(1)} hours</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="text-foreground font-medium">${hourlyRate}/hr</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Confirm Booking"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingFlow;
