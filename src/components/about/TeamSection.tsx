import { Card, CardContent } from "@/components/ui/card";

const team = [
  { name: "Sarah Chen", role: "CEO & Co-Founder", bio: "Former Head of Product at a leading edtech company. Mom of two." },
  { name: "Marcus Johnson", role: "CTO & Co-Founder", bio: "Ex-Google engineer passionate about building safe family tech." },
  { name: "Dr. Elena Vasquez", role: "Chief Safety Officer", bio: "Pediatric psychologist with 15 years in child development research." },
  { name: "Aisha Patel", role: "VP of Community", bio: "Community building expert who grew a parenting network to 500K members." },
];

const TeamSection = () => (
  <section className="space-y-6">
    <h2 className="font-display text-2xl font-bold text-foreground text-center">Our Team</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {team.map((t) => (
        <Card key={t.name} className="border-0 bg-card text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 rounded-full bg-lavender flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary">{t.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <h3 className="font-display font-bold text-foreground">{t.name}</h3>
            <p className="text-xs text-primary font-medium mb-2">{t.role}</p>
            <p className="text-sm text-muted-foreground">{t.bio}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);

export default TeamSection;
