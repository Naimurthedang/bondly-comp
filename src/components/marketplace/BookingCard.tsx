import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface BookingCardProps {
  id: string;
  caregiverName: string;
  status: string;
  startTime: string;
  endTime: string;
  totalAmount: number | null;
  onMessage?: () => void;
  onUpdateStatus?: (status: string) => void;
  isCaregiver?: boolean;
}

const statusColors: Record<string, string> = {
  requested: "bg-accent text-accent-foreground",
  accepted: "bg-sky text-sky-foreground",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-mint text-mint-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  disputed: "bg-destructive/10 text-destructive",
};

const BookingCard = ({
  id, caregiverName, status, startTime, endTime, totalAmount, onMessage, onUpdateStatus, isCaregiver,
}: BookingCardProps) => (
  <Card className="border-0 bg-card">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-foreground">{caregiverName}</h3>
          <Badge className={`text-xs mt-1 ${statusColors[status] || "bg-muted text-muted-foreground"}`}>
            {status.replace("_", " ")}
          </Badge>
        </div>
        {totalAmount && <p className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</p>}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(startTime), "MMM d, yyyy")}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(startTime), "h:mm a")} – {format(new Date(endTime), "h:mm a")}</span>
      </div>
      <div className="flex gap-2">
        {onMessage && (
          <Button variant="outline" size="sm" onClick={onMessage}>
            <MessageCircle size={14} className="mr-1" /> Message
          </Button>
        )}
        {isCaregiver && status === "requested" && onUpdateStatus && (
          <>
            <Button size="sm" onClick={() => onUpdateStatus("accepted")}>Accept</Button>
            <Button variant="destructive" size="sm" onClick={() => onUpdateStatus("cancelled")}>Decline</Button>
          </>
        )}
        {status === "accepted" && onUpdateStatus && (
          <Button size="sm" onClick={() => onUpdateStatus("in_progress")}>Start Session</Button>
        )}
        {status === "in_progress" && onUpdateStatus && (
          <Button size="sm" onClick={() => onUpdateStatus("completed")}>Complete</Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default BookingCard;
