import { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { Shield, Star, Award, Heart, CheckCircle } from "lucide-react";

const badges = [
  { icon: Shield, label: "Child-Safe Verified", desc: "All caregivers background checked" },
  { icon: Star, label: "4.9★ Average Rating", desc: "From 2,000+ parent reviews" },
  { icon: Award, label: "Award Winning", desc: "Best Parenting App 2025" },
  { icon: Heart, label: "10,000+ Families", desc: "Trust Bondly every day" },
  { icon: CheckCircle, label: "COPPA Compliant", desc: "Children's privacy protected" },
];

export const TrustBadges = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <StaggerContainer className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
        {badges.map((b) => (
          <StaggerItem key={b.label}>
            <div className="flex flex-col items-center text-center gap-2 min-w-[140px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <b.icon size={22} className="text-primary" />
              </div>
              <p className="font-display font-bold text-sm text-foreground">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  </section>
);
