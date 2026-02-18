import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, TrendingUp, Calendar, MessageCircle } from "lucide-react";

const EngagementTracker = () => {
  const { user } = useAuth();

  const { data: events = [] } = useQuery({
    queryKey: ["engagement", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_events")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["user-bookings-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("created_at, status")
        .eq("parent_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Build weekly activity chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const activityData = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    events: events.filter((e: any) => e.created_at?.startsWith(day)).length,
  }));

  // Build monthly bookings chart
  const monthlyBookings: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const month = new Date(b.created_at).toLocaleDateString("en", { month: "short" });
    monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
  });
  const bookingChartData = Object.entries(monthlyBookings).map(([month, count]) => ({ month, bookings: count }));

  const totalEvents = events.length;
  const completedBookings = bookings.filter((b: any) => b.status === "completed").length;
  const conversionRate = bookings.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Total Events", value: totalEvents, color: "text-primary" },
          { icon: Calendar, label: "Bookings", value: bookings.length, color: "text-primary" },
          { icon: TrendingUp, label: "Completion %", value: `${conversionRate}%`, color: "text-primary" },
          { icon: MessageCircle, label: "This Week", value: activityData.reduce((s, d) => s + d.events, 0), color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 bg-card">
            <CardContent className="p-4 text-center">
              <stat.icon size={20} className={`mx-auto ${stat.color} mb-1`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Activity */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Booking Trend */}
      {bookingChartData.length > 0 && (
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Booking Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingChartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngagementTracker;
