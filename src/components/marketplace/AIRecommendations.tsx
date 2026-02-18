import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Award, Clock, ChevronRight } from "lucide-react";

interface AIRecommendationsProps {
  onSelectCaregiver: (caregiver: any) => void;
}

const AIRecommendations = ({ onSelectCaregiver }: AIRecommendationsProps) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-recommendations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-recommend", {
        body: { limit: 5 },
      });
      if (error) throw error;
      return data as { recommendations: any[]; ai_insight: string };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Finding your perfect matches...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data?.recommendations?.length) return null;

  const visible = expanded ? data.recommendations : data.recommendations.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">AI Recommended for You</h3>
      </div>

      {data.ai_insight && (
        <Card className="border-0 bg-primary/5">
          <CardContent className="p-4 text-sm text-foreground">
            <p className="italic">"{data.ai_insight}"</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {visible.map((cg: any, i: number) => (
          <Card
            key={cg.id}
            className="border-0 bg-card hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectCaregiver(cg)}
          >
            {cg.is_top_match && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-xl">
                ⭐ Top Match
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-lavender flex items-center justify-center shrink-0 overflow-hidden">
                  {cg.avatar_url ? (
                    <img src={cg.avatar_url} alt={cg.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{cg.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display font-bold text-foreground truncate">{cg.full_name}</h4>
                    <Badge className="text-xs bg-primary/10 text-primary border-0">
                      {cg.compatibility_score}% match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    {cg.average_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-accent-foreground fill-accent" />
                        {cg.average_rating?.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {cg.years_experience || 0}y exp
                    </span>
                    <span className="font-semibold text-primary">${cg.hourly_rate}/hr</span>
                  </div>
                  {cg.match_reasons?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cg.match_reasons.slice(0, 2).map((reason: string, j: number) => (
                        <span key={j} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-muted-foreground self-center shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.recommendations.length > 3 && (
        <Button variant="ghost" className="w-full text-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : `Show ${data.recommendations.length - 3} more matches`}
        </Button>
      )}
    </div>
  );
};

export default AIRecommendations;
