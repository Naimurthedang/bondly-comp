import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Share2, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ReferralSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "BONDLY";

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const sendReferral = useMutation({
    mutationFn: async (referredEmail: string) => {
      const { error } = await supabase.from("referrals").insert({
        referrer_id: user!.id,
        referred_email: referredEmail,
        referral_code: `${referralCode}-${Date.now().toString(36)}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Referral sent!");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
    onError: () => toast.error("Failed to send referral"),
  });

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const stats = {
    total: referrals.length,
    converted: referrals.filter((r: any) => r.status === "converted" || r.status === "rewarded").length,
    rewards: referrals.reduce((sum: number, r: any) => sum + (r.reward_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="p-4 text-center">
            <Users size={24} className="mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Invited</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card">
          <CardContent className="p-4 text-center">
            <CheckCircle size={24} className="mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.converted}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card">
          <CardContent className="p-4 text-center">
            <Gift size={24} className="mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">${stats.rewards}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Share2 size={18} /> Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-lg text-foreground tracking-wider text-center">
              {referralCode}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode}>
              <Copy size={16} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Share this code and earn $10 credit for each parent who books a caregiver!
          </p>
        </CardContent>
      </Card>

      {/* Invite by Email */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Invite a Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) sendReferral.mutate(email);
            }}
            className="flex gap-2"
          >
            <Input
              type="email"
              placeholder="friend@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!email || sendReferral.isPending}>
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Referral History */}
      {referrals.length > 0 && (
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Referral History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.referred_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={r.status === "rewarded" ? "default" : "secondary"} className="text-xs">
                  {r.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralSystem;
