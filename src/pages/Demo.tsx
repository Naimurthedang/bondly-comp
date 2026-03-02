import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";

const Demo = () => (
  <div className="min-h-screen gradient-hero">
    {/* Header */}
    <div className="container mx-auto px-4 pt-8 pb-4">
      <Button variant="ghost" asChild className="gap-2 rounded-full">
        <Link to="/">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </Button>
    </div>

    <div className="container mx-auto px-4 pb-20">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Play size={14} />
            Product Demo
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            See Bondly in Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Watch how Bondly transforms the parenting experience with AI-powered tools,
            personalized content, and a safe community for families.
          </p>
        </motion.div>

        {/* Video embed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-card rounded-3xl p-3 md:p-4 shadow-2xl"
        >
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/_J-G84uaUA4"
              title="Bondly APP showcase. Next-gen Parenting App For Kids and parents."
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* CTA below video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/signup">Start Free Today</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
            <Link to="/about">Learn More</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  </div>
);

export default Demo;
