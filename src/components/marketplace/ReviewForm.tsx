import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  revieweeId: string;
  onSuccess: () => void;
}

const categories = [
  { key: "overall_rating", label: "Overall" },
  { key: "safety_rating", label: "Safety" },
  { key: "kindness_rating", label: "Kindness" },
  { key: "punctuality_rating", label: "Punctuality" },
] as const;

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} onClick={() => onChange(i)} className="focus:outline-none">
        <Star size={20} className={i <= value ? "text-accent-foreground fill-accent" : "text-muted-foreground"} />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ bookingId, revieweeId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({ overall_rating: 0, safety_rating: 0, kindness_rating: 0, punctuality_rating: 0 });
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || ratings.overall_rating === 0) return;
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      ...ratings,
      comment: comment.trim() || null,
    });
    setLoading(false);
    if (error) { toast.error("Failed to submit review"); return; }
    toast.success("Review submitted!");
    onSuccess();
  };

  return (
    <Card className="border-0 bg-card">
      <CardHeader><CardTitle className="font-display">Leave a Review</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{cat.label}</span>
            <StarRating value={ratings[cat.key]} onChange={(v) => setRatings({ ...ratings, [cat.key]: v })} />
          </div>
        ))}
        <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button className="w-full" disabled={loading || ratings.overall_rating === 0} onClick={handleSubmit}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
