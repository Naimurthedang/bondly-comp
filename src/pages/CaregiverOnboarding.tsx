import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const specialtyOptions = ["Infant Care", "Toddler Care", "Special Needs", "Tutoring", "Night Care", "Meal Prep", "Homework Help", "Potty Training"];

const CaregiverOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", bio: "", hourly_rate: "25", years_experience: "0", education: "" });
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const completeness = [form.full_name, form.bio, form.education, selectedSpecialties.length > 0].filter(Boolean).length * 25;

  const handleSubmit = async () => {
    if (!user || !form.full_name.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    const { error } = await supabase.from("caregiver_profiles").insert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      bio: form.bio.trim() || null,
      hourly_rate: parseFloat(form.hourly_rate) || 25,
      years_experience: parseInt(form.years_experience) || 0,
      education: form.education.trim() || null,
      specialties: selectedSpecialties,
      profile_completeness: completeness,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.error("You already have a caregiver profile");
      else toast.error("Failed to create profile");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="border-0 bg-card max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-primary" />
            <h3 className="font-display text-xl font-bold text-foreground">Profile Created!</h3>
            <p className="text-muted-foreground">Your caregiver profile is pending verification. We'll notify you once approved.</p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
          <h1 className="font-display text-xl font-bold text-foreground">Become a Caregiver</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-6">
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="font-display">Your Profile</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full"><div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${completeness}%` }} /></div>
              <span className="text-sm text-muted-foreground">{completeness}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell families about yourself..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Hourly Rate ($)</Label><Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
              <div className="space-y-1"><Label>Years Experience</Label><Input type="number" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Education</Label><Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. BS in Early Childhood Education" /></div>
            <div className="space-y-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((s) => (
                  <Badge
                    key={s}
                    variant={selectedSpecialties.includes(s) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpecialty(s)}
                  >{s}</Badge>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating Profile..." : "Submit for Verification"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CaregiverOnboarding;
