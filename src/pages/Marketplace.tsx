import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CaregiverCard from "@/components/marketplace/CaregiverCard";
import CaregiverSearch, { type SearchFilters } from "@/components/marketplace/CaregiverSearch";
import BookingFlow from "@/components/marketplace/BookingFlow";
import AIRecommendations from "@/components/marketplace/AIRecommendations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({ query: "", specialty: "All", maxRate: "", minRating: "" });
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  const { data: caregivers = [], isLoading } = useQuery({
    queryKey: ["caregivers", filters],
    queryFn: async () => {
      let query = supabase.from("caregiver_profiles").select("*").eq("verification_status", "verified");
      if (filters.maxRate) query = query.lte("hourly_rate", parseFloat(filters.maxRate));
      const { data, error } = await query.order("profile_completeness", { ascending: false });
      if (error) throw error;
      let results = data || [];
      if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter((c: any) => c.full_name.toLowerCase().includes(q) || c.bio?.toLowerCase().includes(q));
      }
      if (filters.specialty && filters.specialty !== "All") {
        results = results.filter((c: any) => (c.specialties as string[])?.includes(filters.specialty));
      }
      return results;
    },
  });

  if (selectedCaregiver) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedCaregiver(null)} className="mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back to search
        </Button>
        <BookingFlow
          caregiverId={selectedCaregiver.user_id}
          caregiverName={selectedCaregiver.full_name}
          hourlyRate={selectedCaregiver.hourly_rate}
          onClose={() => setSelectedCaregiver(null)}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
            <h1 className="font-display text-xl font-bold text-foreground">Find a Caregiver</h1>
          </div>
          {user && <Button variant="outline" onClick={() => navigate("/caregiver/onboarding")}>Become a Caregiver</Button>}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <CaregiverSearch onSearch={setFilters} />
        {user && <AIRecommendations onSelectCaregiver={setSelectedCaregiver} />}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : caregivers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No caregivers found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {caregivers.map((c: any) => (
              <CaregiverCard
                key={c.id}
                id={c.id}
                fullName={c.full_name}
                avatarUrl={c.avatar_url}
                hourlyRate={c.hourly_rate}
                yearsExperience={c.years_experience}
                specialties={(c.specialties as string[]) || []}
                verificationStatus={c.verification_status}
                onClick={() => setSelectedCaregiver(c)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
