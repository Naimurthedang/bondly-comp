import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

interface CaregiverCardProps {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  hourlyRate: number;
  yearsExperience: number;
  specialties: string[];
  verificationStatus: string;
  averageRating?: number;
  reviewCount?: number;
  onClick: (id: string) => void;
}

const CaregiverCard = ({
  id, fullName, avatarUrl, hourlyRate, yearsExperience,
  specialties, verificationStatus, averageRating = 0, reviewCount = 0, onClick,
}: CaregiverCardProps) => (
  <Card
    className="border-0 bg-card hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
    onClick={() => onClick(id)}
  >
    <CardContent className="p-5">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-lavender flex items-center justify-center shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">{fullName.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-foreground truncate">{fullName}</h3>
            {verificationStatus === "verified" && (
              <Badge variant="secondary" className="text-xs shrink-0">✓ Verified</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-accent-foreground fill-accent" />
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {yearsExperience}y exp
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">${hourlyRate}</p>
          <p className="text-xs text-muted-foreground">/hour</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CaregiverCard;
