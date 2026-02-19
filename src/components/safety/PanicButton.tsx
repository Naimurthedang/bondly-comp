import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertTriangle, Phone } from "lucide-react";
import { toast } from "sonner";

interface PanicButtonProps {
  bookingId: string;
}

const PanicButton = ({ bookingId }: PanicButtonProps) => {
  const [sending, setSending] = useState(false);

  const handlePanic = async () => {
    setSending(true);
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
        body: { action: "panic", booking_id: bookingId, latitude, longitude },
      });
      if (error) throw error;

      toast.error("Emergency alert sent!", {
        description: `${data.contacts_notified} emergency contact(s) notified. Admin has been alerted.`,
        duration: 10000,
      });
    } catch (e: any) {
      toast.error("Failed to send alert: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg" className="w-full gap-2 font-bold text-lg py-6">
          <AlertTriangle size={24} />
          PANIC BUTTON
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} /> Emergency Alert
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately alert the parent, notify all emergency contacts, and escalate to platform administrators. Only use in genuine emergencies.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePanic} disabled={sending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Phone size={16} className="mr-2" />
            {sending ? "Sending..." : "Confirm Emergency"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PanicButton;
