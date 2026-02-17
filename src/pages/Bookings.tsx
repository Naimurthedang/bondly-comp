import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BookingCard from "@/components/marketplace/BookingCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "requested" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed" }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Booking updated"); },
    onError: () => toast.error("Failed to update booking"),
  });

  const active = bookings.filter((b: any) => ["requested", "accepted", "in_progress"].includes(b.status));
  const past = bookings.filter((b: any) => ["completed", "cancelled", "disputed"].includes(b.status));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft size={18} /></Button>
          <h1 className="font-display text-xl font-bold text-foreground">My Bookings</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">No bookings yet</p>
            <Button onClick={() => navigate("/marketplace")}>Find a Caregiver</Button>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4"><TabsTrigger value="active">Active ({active.length})</TabsTrigger><TabsTrigger value="past">Past ({past.length})</TabsTrigger></TabsList>
            <TabsContent value="active" className="space-y-3">
              {active.map((b: any) => (
                <BookingCard
                  key={b.id} id={b.id} caregiverName={b.caregiver_id.slice(0, 8)} status={b.status}
                  startTime={b.start_time} endTime={b.end_time} totalAmount={b.total_amount}
                  isCaregiver={b.caregiver_id === user?.id}
                  onMessage={() => navigate(`/messages?booking=${b.id}`)}
                  onUpdateStatus={(status: string) => updateStatus.mutate({ id: b.id, status: status as "requested" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed" })}
                />
              ))}
            </TabsContent>
            <TabsContent value="past" className="space-y-3">
              {past.map((b: any) => (
                <BookingCard key={b.id} id={b.id} caregiverName={b.caregiver_id.slice(0, 8)} status={b.status} startTime={b.start_time} endTime={b.end_time} totalAmount={b.total_amount} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Bookings;
