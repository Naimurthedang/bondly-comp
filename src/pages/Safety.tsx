import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, AlertTriangle, MapPin, Phone, FileText } from "lucide-react";

const SafetyDashboard = lazy(() => import("@/components/safety/SafetyDashboard"));
const EmergencyContacts = lazy(() => import("@/components/safety/EmergencyContacts"));
const GeofenceManager = lazy(() => import("@/components/safety/GeofenceManager"));

const Loader = () => (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Safety = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <Shield size={20} className="text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">Child Safety Center</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs sm:text-sm">
              <AlertTriangle size={14} /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="geofences" className="gap-1.5 text-xs sm:text-sm">
              <MapPin size={14} /> Safe Zones
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5 text-xs sm:text-sm">
              <Phone size={14} /> Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={<Loader />}>
              <SafetyDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="geofences">
            <Suspense fallback={<Loader />}>
              <GeofenceManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="contacts">
            <Suspense fallback={<Loader />}>
              <EmergencyContacts />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Safety;
