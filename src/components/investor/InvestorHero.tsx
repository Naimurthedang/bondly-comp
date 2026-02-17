import { TrendingUp, Users, Globe, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { icon: Users, label: "Active Families", value: "10,000+", color: "bg-lavender" },
  { icon: TrendingUp, label: "Monthly Growth", value: "32%", color: "bg-mint" },
  { icon: Globe, label: "Cities Served", value: "50+", color: "bg-sky" },
  { icon: Shield, label: "Verified Caregivers", value: "5,000+", color: "bg-blush" },
];

const InvestorHero = () => (
  <div className="space-y-12">
    <div className="text-center max-w-3xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
        Invest in the Future of Childcare
      </h1>
      <p className="text-lg text-muted-foreground">
        Bondly is transforming how families find, hire, and manage trusted caregivers — 
        building the operating system for modern parenting.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-0 bg-card text-center">
          <CardContent className="p-6">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
              <s.icon size={22} className="text-foreground/70" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-foreground">Our Vision</h2>
        <p className="text-muted-foreground">Every family deserves access to safe, reliable, and affordable childcare. We're building the platform to make that a reality — combining technology, trust verification, and community.</p>
      </div>
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-foreground">Market Opportunity</h2>
        <p className="text-muted-foreground">The global childcare market is valued at $480B and growing. Parents spend an average of $15,000/year on childcare. Bondly captures this market with a commission-based marketplace model.</p>
      </div>
    </div>

    <div className="p-8 rounded-2xl bg-muted/50 text-center">
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Revenue Model</h2>
      <p className="text-muted-foreground mb-6">Platform fee on bookings + premium subscriptions for families and caregivers</p>
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div><p className="text-xl font-bold text-primary">12%</p><p className="text-xs text-muted-foreground">Booking Fee</p></div>
        <div><p className="text-xl font-bold text-primary">$29/mo</p><p className="text-xs text-muted-foreground">Family Pro</p></div>
        <div><p className="text-xl font-bold text-primary">$19/mo</p><p className="text-xs text-muted-foreground">Caregiver+</p></div>
      </div>
    </div>
  </div>
);

export default InvestorHero;
