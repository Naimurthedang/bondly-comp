import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Percent, Zap } from "lucide-react";

const campaignIcons: Record<string, typeof Sparkles> = {
  discount: Percent,
  boost: Zap,
  event: Sparkles,
  promotion: Sparkles,
};

const ActiveCampaigns = () => {
  const { data: campaigns = [] } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("liveops_campaigns")
        .select("*")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .lte("starts_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (campaigns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
        <Sparkles size={18} className="text-primary" /> Active Promotions
      </h3>
      {campaigns.map((c: any) => {
        const Icon = campaignIcons[c.campaign_type] || Sparkles;
        const endsIn = Math.ceil((new Date(c.ends_at).getTime() - Date.now()) / (1000 * 60 * 60));
        return (
          <Card key={c.id} className="border-0 bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display font-bold text-foreground">{c.title}</h4>
                  {c.discount_percent > 0 && (
                    <Badge className="text-xs">{c.discount_percent}% OFF</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{endsIn > 24 ? `${Math.ceil(endsIn / 24)}d left` : `${endsIn}h left`}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ActiveCampaigns;
