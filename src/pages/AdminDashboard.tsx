import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, DollarSign, TrendingUp, Shield, Sparkles, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(252, 80%, 65%)", "hsl(199, 89%, 60%)", "hsl(45, 100%, 60%)", "hsl(340, 60%, 65%)"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profiles, bookings, caregivers, reviews] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id, status, total_amount", { count: "exact" }),
        supabase.from("caregiver_profiles").select("id, verification_status", { count: "exact" }),
        supabase.from("reviews").select("id, overall_rating", { count: "exact" }),
      ]);
      return {
        totalUsers: profiles.count || 0,
        totalBookings: bookings.count || 0,
        bookings: bookings.data || [],
        totalCaregivers: caregivers.count || 0,
        caregivers: caregivers.data || [],
        totalReviews: reviews.count || 0,
        reviews: reviews.data || [],
        revenue: (bookings.data || []).reduce((s: number, b: any) => s + (b.total_amount || 0), 0),
      };
    },
    enabled: !!user,
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("liveops_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Campaign form
  const [newCampaign, setNewCampaign] = useState({
    title: "", description: "", campaign_type: "discount", discount_percent: 10,
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    target_audience: "all",
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("liveops_campaigns").insert({
        ...newCampaign,
        starts_at: new Date(newCampaign.starts_at).toISOString(),
        ends_at: new Date(newCampaign.ends_at).toISOString(),
        is_active: true,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign created!");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setNewCampaign({ ...newCampaign, title: "", description: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("liveops_campaigns").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }),
  });

  // Chart data
  const bookingStatusData = (() => {
    const counts: Record<string, number> = {};
    (stats?.bookings || []).forEach((b: any) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const verificationData = (() => {
    const counts: Record<string, number> = {};
    (stats?.caregivers || []).forEach((c: any) => { counts[c.verification_status] = (counts[c.verification_status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <Shield size={20} className="text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Users", value: stats?.totalUsers || 0 },
            { icon: DollarSign, label: "Revenue", value: `$${stats?.revenue || 0}` },
            { icon: TrendingUp, label: "Bookings", value: stats?.totalBookings || 0 },
            { icon: BarChart3, label: "Reviews", value: stats?.totalReviews || 0 },
          ].map((s) => (
            <Card key={s.label} className="border-0 bg-card">
              <CardContent className="p-4 text-center">
                <s.icon size={20} className="mx-auto text-primary mb-1" />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 size={14} /> Analytics
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-1.5">
              <Sparkles size={14} /> LiveOps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingStatusData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Caregiver Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={verificationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {verificationData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Create Campaign */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Plus size={18} /> New Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Campaign title" value={newCampaign.title} onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })} />
                <Input placeholder="Description" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newCampaign.campaign_type} onValueChange={(v) => setNewCampaign({ ...newCampaign, campaign_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["discount", "boost", "event", "promotion"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Discount %" value={newCampaign.discount_percent} onChange={(e) => setNewCampaign({ ...newCampaign, discount_percent: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Starts</label>
                    <Input type="datetime-local" value={newCampaign.starts_at} onChange={(e) => setNewCampaign({ ...newCampaign, starts_at: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Ends</label>
                    <Input type="datetime-local" value={newCampaign.ends_at} onChange={(e) => setNewCampaign({ ...newCampaign, ends_at: e.target.value })} />
                  </div>
                </div>
                <Select value={newCampaign.target_audience} onValueChange={(v) => setNewCampaign({ ...newCampaign, target_audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["all", "parents", "caregivers", "new_users", "vip"].map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => createCampaign.mutate()} disabled={!newCampaign.title || createCampaign.isPending} className="w-full">
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Existing Campaigns */}
            <div className="space-y-3">
              {campaigns.map((c: any) => (
                <Card key={c.id} className="border-0 bg-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-foreground">{c.title}</h4>
                        <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{c.campaign_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(c.starts_at).toLocaleDateString()} — {new Date(c.ends_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Switch
                      checked={c.is_active}
                      onCheckedChange={(v) => toggleCampaign.mutate({ id: c.id, active: v })}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
