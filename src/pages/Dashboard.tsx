import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, BookOpen, Puzzle, Heart, Plus, LogOut, Baby, User, Sparkles, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import IframeModule from "@/components/dashboard/IframeModule";
import { motion, AnimatePresence } from "framer-motion";

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  gender: string | null;
}

const featureCards = [
  { icon: Music, title: "AI Songs", description: "Generate personalized lullabies", color: "bg-lavender" },
  { icon: BookOpen, title: "Storybooks", description: "Create custom illustrated stories", color: "bg-sky" },
  { icon: Puzzle, title: "Learning", description: "Interactive educational games", color: "bg-sunshine" },
  { icon: Heart, title: "Guides", description: "Expert parenting advice", color: "bg-blush" },
];

const iframeModules = [
  { id: "fun", label: "Fun & Insights", icon: Sparkles, src: "https://bondly-main.vercel.app/" },
  { id: "voxel", label: "Voxel Toy", icon: Box, src: "https://voxel-toy-simulator.vercel.app/" },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [profile, setProfile] = useState<{ full_name: string; onboarding_completed: boolean } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, babiesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, onboarding_completed").eq("user_id", user.id).single(),
        supabase.from("babies").select("id, name, birth_date, gender").eq("user_id", user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (babiesRes.data) setBabies(babiesRes.data);
      if (profileRes.data && !profileRes.data.onboarding_completed) {
        setShowOnboarding(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      supabase.from("babies").select("id, name, birth_date, gender").eq("user_id", user.id)
        .then(({ data }) => { if (data) setBabies(data); });
      supabase.from("profiles").select("full_name, onboarding_completed").eq("user_id", user.id).single()
        .then(({ data }) => { if (data) setProfile(data); });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Parent";

  return (
    <div className="min-h-screen gradient-hero">
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍼</span>
            <span className="font-display text-xl font-bold">Bondly</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-full">
              <User size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your family</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {iframeModules.map((mod) => (
              <TabsTrigger key={mod.id} value={mod.id} className="gap-2">
                <mod.icon size={14} /> {mod.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="mt-0 space-y-10">
                {/* Baby Profiles */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Babies</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {babies.map((baby) => (
                      <Card key={baby.id} className="glass-card border-0">
                        <CardContent className="flex items-center gap-4 p-6">
                          <div className="w-12 h-12 bg-blush rounded-full flex items-center justify-center">
                            <Baby size={22} className="text-blush-foreground" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-foreground">{baby.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {baby.birth_date ? new Date(baby.birth_date).toLocaleDateString() : "No birth date"}
                              {baby.gender ? ` · ${baby.gender}` : ""}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Card className="glass-card border-0 border-dashed border-2 border-border cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setShowOnboarding(true)}>
                      <CardContent className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
                        <Plus size={20} />
                        <span className="font-medium">Add Baby</span>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Feature Cards */}
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">AI Features</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featureCards.map((feature) => (
                      <Card key={feature.title} className="glass-card border-0 hover:scale-[1.02] transition-transform cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-2`}>
                            <feature.icon size={20} className="text-foreground/70" />
                          </div>
                          <CardTitle className="font-display text-base">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                          <p className="text-xs text-primary mt-2 font-medium">Coming soon →</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </TabsContent>

              {iframeModules.map((mod) => (
                <TabsContent key={mod.id} value={mod.id} className="mt-0">
                  <IframeModule src={mod.src} title={mod.label} />
                </TabsContent>
              ))}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
