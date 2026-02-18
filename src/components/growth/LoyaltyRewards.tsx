import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Crown, Zap, Award } from "lucide-react";

const tierConfig = {
  bronze: { color: "bg-amber-600", next: "silver", pointsNeeded: 500, icon: Trophy },
  silver: { color: "bg-gray-400", next: "gold", pointsNeeded: 1500, icon: Star },
  gold: { color: "bg-yellow-500", next: "platinum", pointsNeeded: 5000, icon: Crown },
  platinum: { color: "bg-primary", next: null, pointsNeeded: Infinity, icon: Zap },
};

const defaultBadges = [
  { id: "first_booking", name: "First Booking", icon: "🎉", description: "Booked your first caregiver" },
  { id: "streak_3", name: "3-Day Streak", icon: "🔥", description: "3 consecutive bookings" },
  { id: "reviewer", name: "Reviewer", icon: "⭐", description: "Left your first review" },
  { id: "referrer", name: "Referrer", icon: "🤝", description: "Referred a friend" },
  { id: "vip", name: "VIP Parent", icon: "👑", description: "10+ completed bookings" },
  { id: "early_bird", name: "Early Bird", icon: "🌅", description: "Booked 24h+ in advance" },
];

const LoyaltyRewards = () => {
  const { user } = useAuth();

  const { data: rewards } = useQuery({
    queryKey: ["loyalty", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data || { points: 0, tier: "bronze", booking_streak: 0, total_bookings: 0, credits_balance: 0, badges: [] };
    },
    enabled: !!user,
  });

  if (!rewards) return null;

  const tier = tierConfig[rewards.tier as keyof typeof tierConfig] || tierConfig.bronze;
  const TierIcon = tier.icon;
  const progress = tier.next ? (rewards.points / tier.pointsNeeded) * 100 : 100;
  const earnedBadges = (rewards.badges as string[]) || [];

  return (
    <div className="space-y-6">
      {/* Tier Card */}
      <Card className="border-0 bg-card overflow-hidden">
        <div className="gradient-primary p-6 text-center">
          <TierIcon size={48} className="mx-auto text-primary-foreground mb-2" />
          <h2 className="font-display text-2xl font-bold text-primary-foreground capitalize">{rewards.tier} Member</h2>
          <p className="text-primary-foreground/80 text-sm">{rewards.points} points earned</p>
        </div>
        <CardContent className="p-5 space-y-4">
          {tier.next && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress to {tier.next}</span>
                <span className="font-medium text-foreground">{rewards.points}/{tier.pointsNeeded}</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Flame size={20} className="mx-auto text-destructive mb-1" />
              <p className="text-lg font-bold text-foreground">{rewards.booking_streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div>
              <Award size={20} className="mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{rewards.total_bookings}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div>
              <Star size={20} className="mx-auto text-accent-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">${rewards.credits_balance}</p>
              <p className="text-xs text-muted-foreground">Credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {defaultBadges.map((badge) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl p-3 text-center transition-all ${
                    earned ? "bg-primary/10 border border-primary/20" : "bg-muted/50 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-xs font-medium text-foreground mt-1">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                  {earned && <Badge className="mt-1 text-[10px]">Earned</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { action: "Complete a booking", pts: "+50 pts" },
            { action: "Leave a review", pts: "+25 pts" },
            { action: "Refer a friend", pts: "+100 pts" },
            { action: "Maintain booking streak", pts: "+10 pts/day" },
            { action: "Complete profile", pts: "+30 pts" },
          ].map((item) => (
            <div key={item.action} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-muted-foreground">{item.action}</span>
              <span className="font-medium text-primary">{item.pts}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyRewards;
