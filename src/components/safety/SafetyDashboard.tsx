import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, MapPin, FileText, Clock } from "lucide-react";

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-destructive text-destructive-foreground",
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  investigating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  escalated: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  false_alarm: "bg-muted text-muted-foreground",
};

const SafetyDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["safety-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("safety-monitor", {
        body: { action: "dashboard" },
      });
      if (error) throw error;
      return data as { incidents: any[]; checkins: any[]; reports: any[] };
    },
    enabled: !!user,
    refetchInterval: 30000, // refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const incidents = data?.incidents || [];
  const checkins = data?.checkins || [];
  const reports = data?.reports || [];

  const openIncidents = incidents.filter((i: any) => i.status === "open" || i.status === "escalated");
  const criticalCount = incidents.filter((i: any) => i.severity === "critical").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: "Open Incidents", value: openIncidents.length, color: openIncidents.length > 0 ? "text-destructive" : "text-primary" },
          { icon: Shield, label: "Critical Alerts", value: criticalCount, color: criticalCount > 0 ? "text-destructive" : "text-primary" },
          { icon: MapPin, label: "Check-ins Today", value: checkins.filter((c: any) => new Date(c.created_at).toDateString() === new Date().toDateString()).length, color: "text-primary" },
          { icon: FileText, label: "Reports", value: reports.length, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="border-0 bg-card">
            <CardContent className="p-4 text-center">
              <s.icon size={20} className={`mx-auto mb-1 ${s.color}`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="incidents" className="gap-1.5 text-xs sm:text-sm">
            <AlertTriangle size={14} /> Incidents
          </TabsTrigger>
          <TabsTrigger value="checkins" className="gap-1.5 text-xs sm:text-sm">
            <MapPin size={14} /> Check-ins
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm">
            <FileText size={14} /> Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-3">
          {incidents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No incidents recorded</p>
          ) : incidents.map((inc: any) => (
            <Card key={inc.id} className="border-0 bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground capitalize">
                        {inc.incident_type.replace(/_/g, " ")}
                      </span>
                      <Badge className={severityColors[inc.severity]}>{inc.severity}</Badge>
                      <Badge className={statusColors[inc.status]}>{inc.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={10} /> {new Date(inc.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checkins" className="space-y-3">
          {checkins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No check-ins recorded</p>
          ) : checkins.map((c: any) => (
            <Card key={c.id} className="border-0 bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${c.is_within_geofence ? "bg-green-500" : "bg-destructive"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {c.check_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                    {!c.is_within_geofence && " • Outside geofence"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No wellbeing reports yet</p>
          ) : reports.map((r: any) => (
            <Card key={r.id} className="border-0 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{["", "😢", "😟", "😐", "😊", "😄"][r.mood_rating]}</span>
                  <span className="font-medium text-foreground">Mood: {r.mood_rating}/5</span>
                </div>
                {r.ai_generated_summary && (
                  <p className="text-sm text-foreground bg-primary/5 p-3 rounded-lg mb-2">{r.ai_generated_summary}</p>
                )}
                {r.care_notes && <p className="text-sm text-muted-foreground">{r.care_notes}</p>}
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock size={10} /> {new Date(r.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SafetyDashboard;
