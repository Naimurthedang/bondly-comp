import { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Sarah M.", role: "Mom of 2", location: "Austin, TX", childAge: "3 & 5 years", text: "Bondly's bedtime songs have completely transformed our nighttime routine. My daughter asks for her special song every night!", avatar: "👩" },
  { name: "James K.", role: "New Dad", location: "Brooklyn, NY", childAge: "8 months", text: "The storybooks are incredible. Seeing my son as the hero of his own story — priceless. This app is a must-have.", avatar: "👨" },
  { name: "Priya R.", role: "Mom of 1", location: "San Francisco, CA", childAge: "14 months", text: "The parenting guides helped me understand my baby's development milestones so much better. Highly recommend!", avatar: "👩‍🦱" },
  { name: "David L.", role: "Dad of 3", location: "Chicago, IL", childAge: "2, 5 & 7 years", text: "We use the learning puzzles daily. My kids love them and I can see their progress. Best investment for our family.", avatar: "👨‍🦲" },
  { name: "Maria G.", role: "Working Mom", location: "Miami, FL", childAge: "18 months", text: "The caregiver matching is amazing. Found our perfect nanny within a day. The safety features give me peace of mind.", avatar: "👩‍🦰" },
  { name: "Tom W.", role: "Stay-at-home Dad", location: "Seattle, WA", childAge: "11 months", text: "The real-time check-ins during babysitting sessions are a game changer. I finally feel comfortable leaving my son.", avatar: "🧔" },
];

export const Testimonials = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-4">
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={24} className="fill-accent text-accent" />
          ))}
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Loved by families everywhere
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of parents who are building stronger bonds with their children.
        </p>
      </div>

      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-display font-bold px-4 py-2 rounded-full text-sm">
          <Star size={14} className="fill-primary" /> 4.9 out of 5 from 2,000+ reviews
        </span>
      </div>

      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
                  <p className="text-xs text-muted-foreground">Child: {t.childAge}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  </section>
);
