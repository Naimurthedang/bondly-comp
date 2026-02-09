import { Music, BookOpen, Puzzle, Heart, Film, TrendingUp } from "lucide-react";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

const features = [
  { icon: Music, title: "AI Bedtime Songs", description: "Personalized lullabies crafted just for your baby's name and preferences.", color: "bg-lavender" },
  { icon: BookOpen, title: "AI Storybooks", description: "Beautiful illustrated stories featuring your child as the hero.", color: "bg-sky" },
  { icon: Puzzle, title: "Learning Puzzles", description: "Age-appropriate games that grow with your child's development.", color: "bg-sunshine" },
  { icon: Heart, title: "Parenting Guide", description: "Expert AI guidance for every milestone and challenge.", color: "bg-blush" },
  { icon: Film, title: "Rhymes Videos", description: "Animated nursery rhymes customized for engagement.", color: "bg-mint" },
  { icon: TrendingUp, title: "Growth Tracking", description: "Monitor milestones and celebrate every achievement.", color: "bg-lavender" },
];

export const Features = () => (
  <section id="features" className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Everything your family needs
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Six powerful AI features designed to strengthen the bond between you and your baby.
        </p>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature) => (
          <StaggerItem key={feature.title}>
            <div className="glass-card p-6 h-full hover:scale-[1.02] transition-transform duration-300 cursor-default">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon size={22} className="text-foreground/70" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  </section>
);
