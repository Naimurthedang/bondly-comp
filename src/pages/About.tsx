import TeamSection from "@/components/about/TeamSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Heart, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const values = [
  { icon: Shield, title: "Safety First", desc: "Every caregiver undergoes a rigorous multi-step verification process including background checks and reference validation." },
  { icon: Heart, title: "Family-Centered", desc: "Built by parents, for parents. Every feature is designed with real family needs in mind." },
  { icon: Users, title: "Community Driven", desc: "Our community of parents and caregivers creates a network of trust and shared knowledge." },
  { icon: CheckCircle, title: "Quality Assured", desc: "Continuous monitoring, reviews, and feedback ensure consistent quality of care." },
];

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft size={18} /></Button>
          <h1 className="font-display text-xl font-bold text-foreground">About Bondly</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-black text-foreground mb-4">Our Story</h1>
          <p className="text-lg text-muted-foreground">
            Bondly was born from a simple frustration: finding trustworthy childcare shouldn't be this hard. 
            We're building the platform we wish existed when we became parents.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {values.map((v) => (
            <Card key={v.title} className="border-0 bg-card">
              <CardContent className="p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center shrink-0">
                  <v.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-muted/50 space-y-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center">Our Vetting Process</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-center">
            {["Identity Verification", "Background Check", "Reference Calls", "Skills Assessment"].map((step, i) => (
              <div key={step}>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-bold">{i + 1}</div>
                <p className="text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <TeamSection />

        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/invest")}>Invest in Our Mission</Button>
        </div>
      </main>
    </div>
  );
};

export default About;
