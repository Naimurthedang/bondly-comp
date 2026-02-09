import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero pt-16">
    {/* Floating decorative blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-lavender/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sunshine/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles size={14} />
            AI-powered parenting companion
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-extrabold text-foreground leading-tight mb-6"
        >
          Build magical bonds
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            with your little one
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Personalized AI bedtime songs, storybooks, learning games, and parenting guidance
          — all tailored to your baby's unique personality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="rounded-full px-8 text-base gap-2">
            <Link to="/signup">
              Start Free <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
            <a href="#demo">See Demo</a>
          </Button>
        </motion.div>

        {/* Floating illustration placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 mx-auto max-w-3xl glass-card p-8 rounded-3xl"
        >
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-lavender/50 via-sky/30 to-sunshine/40 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">👶</span>
              <p className="text-muted-foreground font-medium">Interactive Dashboard Preview</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
