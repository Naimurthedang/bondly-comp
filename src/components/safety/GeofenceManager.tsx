import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const GeofenceManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "Home", latitude: "", longitude: "", radius_meters: "200" });

  const { data: zones = [] } = useQuery({
    queryKey: ["geofence-zones", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geofence_zones")
        .select("*")
        .eq("parent_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addZone = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("geofence_zones").insert({
        parent_id: user!.id,
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius_meters: parseInt(form.radius_meters),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Zone added");
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      setForm({ name: "", latitude: "", longitude: "", radius_meters: "200" });
    },
    onError: (e) => toast.error(e.message),
  });

  const useCurrentLocation = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
      toast.success("Location captured");
    } catch {
      toast.error("Could not get your location");
    }
  };

  const toggleZone = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("geofence_zones").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["geofence-zones"] }),
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("geofence_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Zone removed");
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
    },
  });

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Safe Zones (Geofencing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {zones.map((z: any) => (
          <div key={z.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium text-foreground">{z.name}</p>
              <p className="text-xs text-muted-foreground">
                {Number(z.latitude).toFixed(4)}, {Number(z.longitude).toFixed(4)} • {z.radius_meters}m radius
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={z.is_active} onCheckedChange={(v) => toggleZone.mutate({ id: z.id, active: v })} />
              <Button variant="ghost" size="icon" onClick={() => deleteZone.mutate(z.id)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground">Add Safe Zone</p>
          <Input placeholder="Zone name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <Input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          <Button variant="outline" onClick={useCurrentLocation} className="w-full gap-2">
            <MapPin size={14} /> Use Current Location
          </Button>
          <Input placeholder="Radius (meters)" value={form.radius_meters} onChange={(e) => setForm({ ...form, radius_meters: e.target.value })} />
          <Button
            onClick={() => addZone.mutate()}
            disabled={!form.latitude || !form.longitude || addZone.isPending}
            className="w-full gap-2"
          >
            <Plus size={16} /> Add Zone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeofenceManager;
