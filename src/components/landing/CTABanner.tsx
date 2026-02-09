import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedSection } from "./AnimatedSection";
import { ArrowRight } from "lucide-react";

export const CTABanner = () => (
  <AnimatedSection className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto gradient-primary rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of parents creating magical moments with their little ones.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 text-base bg-background text-foreground hover:bg-background/90 gap-2"
          >
            <Link to="/signup">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </AnimatedSection>
);
