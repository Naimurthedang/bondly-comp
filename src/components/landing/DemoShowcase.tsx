import { AnimatedSection } from "./AnimatedSection";
import { Play, BookOpen, Puzzle } from "lucide-react";

export const DemoShowcase = () => (
  <section id="demo" className="py-24 gradient-hero">
    <div className="container mx-auto px-4">
      <AnimatedSection className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          See it in action
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A sneak peek at what Bondly creates for your family.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <AnimatedSection delay={0.1}>
          <div className="glass-card p-6 rounded-2xl">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-lavender/50 to-sky/30 flex flex-col items-center justify-center mb-4">
              <BookOpen size={40} className="text-primary mb-3" />
              <p className="font-display font-bold text-foreground">Storybook</p>
              <p className="text-xs text-muted-foreground mt-1">Custom illustrated tales</p>
            </div>
            <h3 className="font-display font-bold text-foreground">AI Storybooks</h3>
            <p className="text-sm text-muted-foreground">Beautifully crafted PDF stories</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="glass-card p-6 rounded-2xl">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-blush/50 to-sunshine/30 flex flex-col items-center justify-center mb-4">
              <Play size={40} className="text-primary mb-3" />
              <p className="font-display font-bold text-foreground">Audio Player</p>
              <div className="flex gap-1 mt-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-primary/40 rounded-full" style={{ height: `${Math.random() * 24 + 8}px` }} />
                ))}
              </div>
            </div>
            <h3 className="font-display font-bold text-foreground">Bedtime Songs</h3>
            <p className="text-sm text-muted-foreground">Personalized lullabies</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="glass-card p-6 rounded-2xl">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-mint/50 to-lavender/30 flex flex-col items-center justify-center mb-4">
              <Puzzle size={40} className="text-primary mb-3" />
              <p className="font-display font-bold text-foreground">Learning</p>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded bg-primary/20" />
                ))}
              </div>
            </div>
            <h3 className="font-display font-bold text-foreground">Learning Puzzles</h3>
            <p className="text-sm text-muted-foreground">Fun educational games</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);
