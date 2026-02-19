import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, AlertTriangle, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface SessionTrackerProps {
  bookingId: string;
}

const SessionTracker = ({ bookingId }: SessionTrackerProps) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [checkins, setCheckins] = useState<any[]>([]);

  const performCheckin = async (checkType: string) => {
    setLoading(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch { /* location unavailable */ }

      const { data, error } = await supabase.functions.invoke("safety-monitor", {
        body: { action: "checkin", booking_id: bookingId, check_type: checkType, latitude, longitude, notes },
      });
      if (error) throw error;

      setCheckins(prev => [...prev, data.checkin]);
      if (checkType === "check_in") setCheckedIn(true);
      if (checkType === "check_out") setCheckedIn(false);

      if (!data.within_geofence) {
        toast.warning("You are outside the approved zone. The parent has been notified.");
      } else {
        toast.success(`${checkType === "check_in" ? "Checked in" : checkType === "check_out" ? "Checked out" : "Check-in recorded"} successfully`);
      }
      setNotes("");
    } catch (e: any) {
      toast.error("Check-in failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Session Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={checkedIn ? "default" : "secondary"}>
            {checkedIn ? "Active Session" : "Not Checked In"}
          </Badge>
        </div>

        <Textarea
          placeholder="Add notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => performCheckin("check_in")}
            disabled={loading || checkedIn}
            className="gap-2"
          >
            <LogIn size={16} /> Check In
          </Button>
          <Button
            onClick={() => performCheckin("check_out")}
            disabled={loading || !checkedIn}
            variant="outline"
            className="gap-2"
          >
            <LogOut size={16} /> Check Out
          </Button>
        </div>

        {checkedIn && (
          <Button
            onClick={() => performCheckin("periodic")}
            disabled={loading}
            variant="secondary"
            className="w-full gap-2"
          >
            <Clock size={16} /> Periodic Check-in
          </Button>
        )}

        {checkins.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium text-muted-foreground">Recent Check-ins</p>
            {checkins.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                {c.is_within_geofence ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : (
                  <AlertTriangle size={14} className="text-destructive" />
                )}
                <span className="capitalize">{c.check_type.replace("_", " ")}</span>
                <span className="text-xs">
                  {new Date(c.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionTracker;
