import { useState, useCallback, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Music, BookOpen, Puzzle, Heart, Plus, LogOut, Baby, User, Sparkles, Box,
  MessageCircle, Target, Bath, Calendar, ListChecks, ShoppingCart,
  UtensilsCrossed, BookOpen as Journal, Cake, Home, ChevronLeft, Menu,
  Users, CalendarCheck, Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import IframeModule from "@/components/dashboard/IframeModule";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Lazy load feature modules
const ChatBot = lazy(() => import("@/components/chatbot/ChatBot"));
const MilestoneTracker = lazy(() => import("@/components/features/MilestoneTracker"));
const PottyTracker = lazy(() => import("@/components/features/PottyTracker"));
const FamilyCalendar = lazy(() => import("@/components/features/FamilyCalendar"));
const ChoreSystem = lazy(() => import("@/components/features/ChoreSystem"));
const ShoppingList = lazy(() => import("@/components/features/ShoppingList"));
const MealPlanner = lazy(() => import("@/components/features/MealPlanner"));
const FamilyJournal = lazy(() => import("@/components/features/FamilyJournal"));
const BirthdayTracker = lazy(() => import("@/components/features/BirthdayTracker"));

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  gender: string | null;
}

const navItems = [
  { id: "overview", label: "Home", icon: Home },
  { id: "chat", label: "AI Chat", icon: MessageCircle },
  { id: "marketplace", label: "Marketplace", icon: Users, route: "/marketplace" },
  { id: "bookings", label: "Bookings", icon: CalendarCheck, route: "/bookings" },
  { id: "messages", label: "Messages", icon: Mail, route: "/messages" },
  { id: "milestones", label: "Milestones", icon: Target },
  { id: "potty", label: "Potty Tracker", icon: Bath },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "chores", label: "Chores", icon: ListChecks },
  { id: "shopping", label: "Shopping", icon: ShoppingCart },
  { id: "meals", label: "Meal Plan", icon: UtensilsCrossed },
  { id: "journal", label: "Journal", icon: Journal },
  { id: "birthdays", label: "Birthdays", icon: Cake },
  { id: "fun", label: "Fun & Insights", icon: Sparkles },
  { id: "voxel", label: "Voxel Toy", icon: Box },
];

const featureCards = [
  { icon: Music, title: "AI Songs", description: "Generate personalized lullabies", color: "bg-lavender" },
  { icon: BookOpen, title: "Storybooks", description: "Create custom illustrated stories", color: "bg-sky" },
  { icon: Puzzle, title: "Learning", description: "Interactive educational games", color: "bg-sunshine" },
  { icon: Heart, title: "Guides", description: "Expert parenting advice", color: "bg-blush" },
];

const iframeModules = [
  { id: "fun", src: "https://bondly-main.vercel.app/", title: "Fun & Insights" },
  { id: "voxel", src: "https://voxel-toy-simulator.vercel.app/", title: "Voxel Toy" },
];

const ModuleLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, onboarding_completed")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      if (data && !data.onboarding_completed) setShowOnboarding(true);
      return data;
    },
    enabled: !!user,
  });

  const { data: babies = [], isLoading: babiesLoading } = useQuery({
    queryKey: ["babies", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("babies")
        .select("id, name, birth_date, gender")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as BabyProfile[];
    },
    enabled: !!user,
  });

  const handleLogout = useCallback(async () => {
    await signOut();
    queryClient.clear();
    navigate("/");
  }, [signOut, navigate, queryClient]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["babies", user?.id] });
  }, [queryClient, user?.id]);

  const loading = profileLoading || babiesLoading;

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

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <Suspense fallback={<ModuleLoader />}><ChatBot /></Suspense>;
      case "milestones":
        return <Suspense fallback={<ModuleLoader />}><MilestoneTracker /></Suspense>;
      case "potty":
        return <Suspense fallback={<ModuleLoader />}><PottyTracker /></Suspense>;
      case "calendar":
        return <Suspense fallback={<ModuleLoader />}><FamilyCalendar /></Suspense>;
      case "chores":
        return <Suspense fallback={<ModuleLoader />}><ChoreSystem /></Suspense>;
      case "shopping":
        return <Suspense fallback={<ModuleLoader />}><ShoppingList /></Suspense>;
      case "meals":
        return <Suspense fallback={<ModuleLoader />}><MealPlanner /></Suspense>;
      case "journal":
        return <Suspense fallback={<ModuleLoader />}><FamilyJournal /></Suspense>;
      case "birthdays":
        return <Suspense fallback={<ModuleLoader />}><BirthdayTracker /></Suspense>;
      case "fun":
      case "voxel": {
        const mod = iframeModules.find((m) => m.id === activeTab);
        return mod ? <IframeModule src={mod.src} title={mod.title} /> : null;
      }
      default:
        return <OverviewContent babies={babies} setShowOnboarding={setShowOnboarding} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-4 border-b border-border shrink-0">
          <span className="text-2xl">🍼</span>
          {sidebarOpen && <span className="font-display text-lg font-bold text-foreground">Bondly</span>}
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => (item as any).route ? navigate((item as any).route) : setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <User size={18} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{displayName}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted"
        >
          <ChevronLeft size={12} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {/* Main */}
      <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-56" : "ml-16")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center px-6 border-b border-border bg-background/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={18} />
          </Button>
          <h1 className="font-display text-lg font-bold text-foreground">
            {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
          </h1>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

/* Extracted Overview content */
const OverviewContent = ({
  babies,
  setShowOnboarding,
}: {
  babies: BabyProfile[];
  setShowOnboarding: (v: boolean) => void;
}) => (
  <div className="space-y-10">
    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Babies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {babies.map((baby) => (
          <Card key={baby.id} className="border-0 bg-card">
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
        <Card
          className="border-0 border-dashed border-2 border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setShowOnboarding(true)}
        >
          <CardContent className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
            <Plus size={20} />
            <span className="font-medium">Add Baby</span>
          </CardContent>
        </Card>
      </div>
    </section>

    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">AI Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="border-0 bg-card hover:scale-[1.02] transition-transform cursor-pointer">
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
  </div>
);

export default Dashboard;
