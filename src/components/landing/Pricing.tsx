import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying things out",
    features: ["1 baby profile", "3 AI songs/month", "1 AI story/month", "Basic learning games", "Community support"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For growing families",
    features: ["3 baby profiles", "Unlimited AI songs", "Unlimited stories", "All learning games", "Parenting guides", "Growth tracking", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Family",
    price: "$14.99",
    period: "/month",
    description: "The complete experience",
    features: ["Unlimited profiles", "Everything in Pro", "Custom rhyme videos", "Family sharing", "Offline downloads", "Early feature access", "Dedicated support"],
    cta: "Start Free Trial",
    featured: false,
  },
];

export const Pricing = () => (
  <section id="pricing" className="py-24 gradient-hero">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Simple, honest pricing
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Start free. Upgrade when your family is ready.
        </p>
      </div>

      <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
        {plans.map((plan) => (
          <StaggerItem key={plan.name}>
            <div className={`rounded-2xl p-8 h-full ${plan.featured ? "bg-foreground text-background shadow-2xl scale-105" : "glass-card"}`}>
              <h3 className={`font-display text-lg font-bold mb-1 ${plan.featured ? "" : "text-foreground"}`}>{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}>{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-display font-extrabold">{plan.price}</span>
                <span className={`text-sm ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={16} className={plan.featured ? "text-background/80" : "text-primary"} />
                    <span className={plan.featured ? "text-background/80" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full rounded-full ${plan.featured ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                variant={plan.featured ? "default" : "outline"}
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  </section>
);
