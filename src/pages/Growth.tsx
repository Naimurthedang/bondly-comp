import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Gift, Trophy, Activity, Sparkles } from "lucide-react";
import { lazy, Suspense } from "react";

const ReferralSystem = lazy(() => import("@/components/growth/ReferralSystem"));
const LoyaltyRewards = lazy(() => import("@/components/growth/LoyaltyRewards"));
const EngagementTracker = lazy(() => import("@/components/growth/EngagementTracker"));
const ActiveCampaigns = lazy(() => import("@/components/growth/ActiveCampaigns"));

const ModuleLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Growth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Rewards & Growth</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Active Campaigns */}
        <Suspense fallback={<ModuleLoader />}>
          <ActiveCampaigns />
        </Suspense>

        <Tabs defaultValue="rewards" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="rewards" className="flex items-center gap-1.5">
              <Trophy size={14} /> Rewards
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-1.5">
              <Gift size={14} /> Referrals
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1.5">
              <Activity size={14} /> Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <Suspense fallback={<ModuleLoader />}>
              <LoyaltyRewards />
            </Suspense>
          </TabsContent>
          <TabsContent value="referrals">
            <Suspense fallback={<ModuleLoader />}>
              <ReferralSystem />
            </Suspense>
          </TabsContent>
          <TabsContent value="activity">
            <Suspense fallback={<ModuleLoader />}>
              <EngagementTracker />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Growth;
