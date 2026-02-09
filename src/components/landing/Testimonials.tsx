import { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Sarah M.", role: "Mom of 2", text: "Bondly's bedtime songs have completely transformed our nighttime routine. My daughter asks for her special song every night!", avatar: "👩" },
  { name: "James K.", role: "New Dad", text: "The storybooks are incredible. Seeing my son as the hero of his own story — priceless. This app is a must-have.", avatar: "👨" },
  { name: "Priya R.", role: "Mom of 1", text: "The parenting guides helped me understand my baby's development milestones so much better. Highly recommend!", avatar: "👩‍🦱" },
  { name: "David L.", role: "Dad of 3", text: "We use the learning puzzles daily. My kids love them and I can see their progress. Best investment for our family.", avatar: "👨‍🦲" },
];

export const Testimonials = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Loved by families
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of parents who are building stronger bonds.
        </p>
      </div>

      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <div className="glass-card p-6 h-full">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  </section>
);
