import { Music, BookOpen, Puzzle, Heart, Film, TrendingUp, Star, Shield, Award, CheckCircle, Check, Globe, Menu, X, Smartphone, Apple, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";

const WEB_URL = "https://bondly-web-version.lovable.app";
const IOS_URL = "blob:https://myprogrammingschool.com/73c4762a-4e8e-439d-96be-2bc36277e0e6";
const ANDROID_URL = "https://webtonative-demo-apps.s3.ap-south-1.amazonaws.com/android/69ca78a013c7d7f77e6ae4be/69ca78a013c7d7f77e6ae4be.apk";

/* ───── 3D Floating Orbs ───── */
const FloatingOrb = ({ position, color, speed = 1, distort = 0.4, size = 1 }: any) => (
  <Float speed={speed} rotationIntensity={0.4} floatIntensity={2}>
    <Sphere args={[size, 64, 64]} position={position}>
      <MeshDistortMaterial color={color} distort={distort} speed={2} roughness={0.2} metalness={0.8} transparent opacity={0.6} />
    </Sphere>
  </Float>
);

const FloatingTorus = ({ position, color }: any) => (
  <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
    <Torus args={[0.8, 0.3, 32, 64]} position={position} rotation={[Math.PI / 4, 0, 0]}>
      <MeshDistortMaterial color={color} distort={0.2} speed={3} roughness={0.1} metalness={0.9} transparent opacity={0.4} />
    </Torus>
  </Float>
);

const Scene3D = () => (
  <div className="absolute inset-0 z-[2] pointer-events-none">
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, 5]} intensity={0.8} color="#06b6d4" />
      <Suspense fallback={null}>
        <FloatingOrb position={[-5, 3, -2]} color="#818cf8" speed={1.2} size={1.2} />
        <FloatingOrb position={[5, -2, -3]} color="#06b6d4" speed={0.8} distort={0.6} size={0.8} />
        <FloatingOrb position={[-3, -4, -1]} color="#f472b6" speed={1} size={0.6} />
        <FloatingOrb position={[4, 4, -4]} color="#a78bfa" speed={0.6} distort={0.3} size={1.5} />
        <FloatingTorus position={[6, 1, -3]} color="#22d3ee" />
        <FloatingTorus position={[-6, -1, -5]} color="#c084fc" />
      </Suspense>
    </Canvas>
  </div>
);

/* ───── Parallax Card Wrapper ───── */
const ParallaxCard = ({ children, className = "", index = 0 }: { children: React.ReactNode; className?: string; index?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      className={className}
      style={{ perspective: 800 }}
    >
      {children}
    </motion.div>
  );
};

/* ───── Section Parallax ───── */
const ParallaxSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  return (
    <motion.section ref={ref} style={{ y }} className={className}>
      {children}
    </motion.section>
  );
};

/* ───── Download Dropdown ───── */
const DownloadDropdown = ({ className = "" }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform cursor-pointer inline-flex items-center gap-3"
      >
        <Smartphone size={20} /> Download App <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute top-full left-0 right-0 mt-2 liquid-glass rounded-xl overflow-hidden z-50"
        >
          <a href={IOS_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-4 text-sm text-foreground hover:bg-foreground/5 transition-colors border-b border-foreground/10">
            <Apple size={18} /> Download for iOS
          </a>
          <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-4 text-sm text-foreground hover:bg-foreground/5 transition-colors">
            <Smartphone size={18} /> Download for Android
          </a>
        </motion.div>
      )}
    </div>
  );
};

/* ───── Nav ───── */
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
      <a href="#" className="flex items-center gap-2">
        <span className="text-2xl">🍼</span>
        <span className="text-3xl tracking-tight text-foreground font-display">
          Bondly<sup className="text-xs">®</sup>
        </span>
      </a>
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((l) => (
          <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
        ))}
      </div>
      <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform">
        Begin Journey
      </a>
      <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 liquid-glass p-6 flex flex-col gap-4 md:hidden">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

/* ───── Hero ───── */
const Hero = () => (
  <section className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-40 md:py-[90px]">
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal font-display"
    >
      Build magical <em className="not-italic text-muted-foreground">bonds</em>
      <br />
      with your <em className="not-italic text-muted-foreground">little one.</em>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed"
    >
      AI-powered bedtime songs, storybooks, learning games, and parenting guidance — all personalized for your baby's unique personality.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="flex flex-col sm:flex-row gap-4 mt-12"
    >
      <a href={WEB_URL} target="_blank" rel="noopener noreferrer"
        className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform cursor-pointer inline-flex items-center gap-3">
        <Globe size={20} /> Open in Web
      </a>
      <DownloadDropdown />
    </motion.div>
  </section>
);

/* ───── Features ───── */
const features = [
  { icon: Music, title: "AI Bedtime Songs", description: "Personalized lullabies crafted just for your baby's name and preferences.", gradient: "from-[hsl(252,80%,65%)] to-[hsl(199,89%,60%)]" },
  { icon: BookOpen, title: "AI Storybooks", description: "Beautiful illustrated stories featuring your child as the hero.", gradient: "from-[hsl(340,60%,65%)] to-[hsl(45,100%,65%)]" },
  { icon: Puzzle, title: "Learning Puzzles", description: "Age-appropriate games that grow with your child's development.", gradient: "from-[hsl(160,50%,55%)] to-[hsl(199,89%,60%)]" },
  { icon: Heart, title: "Parenting Guide", description: "Expert AI guidance for every milestone and challenge.", gradient: "from-[hsl(340,60%,65%)] to-[hsl(252,80%,65%)]" },
  { icon: Film, title: "Rhymes Videos", description: "Animated nursery rhymes customized for engagement.", gradient: "from-[hsl(45,100%,65%)] to-[hsl(340,60%,65%)]" },
  { icon: TrendingUp, title: "Growth Tracking", description: "Monitor milestones and celebrate every achievement.", gradient: "from-[hsl(199,89%,60%)] to-[hsl(252,80%,65%)]" },
];

const Features = () => (
  <ParallaxSection className="relative z-10 py-24" >
    <div className="max-w-6xl mx-auto px-6" id="features">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4 font-display">
          Everything your family needs
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Six powerful AI features designed to strengthen the bond between you and your baby.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <ParallaxCard key={f.title} index={i}>
            <div className="liquid-glass rounded-2xl p-6 h-full group relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon size={22} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-display">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          </ParallaxCard>
        ))}
      </div>
    </div>
  </ParallaxSection>
);

/* ───── Demo ───── */
const DemoShowcase = () => (
  <ParallaxSection className="relative z-10 py-24">
    <div className="max-w-5xl mx-auto px-6" id="demo">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4 font-display">See it in action</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A sneak peek at what Bondly creates for your family.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="liquid-glass rounded-2xl p-2 md:p-4 shadow-2xl shadow-[hsl(252,80%,65%)]/10"
      >
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-xl"
            src="https://www.youtube.com/embed/_J-G84uaUA4"
            title="Bondly APP showcase"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </motion.div>
    </div>
  </ParallaxSection>
);

/* ───── Testimonials ───── */
const testimonials = [
  { name: "Sarah M.", role: "Mom of 2", location: "Austin, TX", childAge: "3 & 5 years", text: "Bondly's bedtime songs have completely transformed our nighttime routine. My daughter asks for her special song every night!", avatar: "👩" },
  { name: "James K.", role: "New Dad", location: "Brooklyn, NY", childAge: "8 months", text: "The storybooks are incredible. Seeing my son as the hero of his own story — priceless. This app is a must-have.", avatar: "👨" },
  { name: "Priya R.", role: "Mom of 1", location: "San Francisco, CA", childAge: "14 months", text: "The parenting guides helped me understand my baby's development milestones so much better. Highly recommend!", avatar: "👩‍🦱" },
  { name: "David L.", role: "Dad of 3", location: "Chicago, IL", childAge: "2, 5 & 7 years", text: "We use the learning puzzles daily. My kids love them and I can see their progress. Best investment for our family.", avatar: "👨‍🦲" },
  { name: "Maria G.", role: "Working Mom", location: "Miami, FL", childAge: "18 months", text: "The caregiver matching is amazing. Found our perfect nanny within a day. The safety features give me peace of mind.", avatar: "👩‍🦰" },
  { name: "Tom W.", role: "Stay-at-home Dad", location: "Seattle, WA", childAge: "11 months", text: "The real-time check-ins during babysitting sessions are a game changer. I finally feel comfortable leaving my son.", avatar: "🧔" },
];

const Testimonials = () => (
  <ParallaxSection className="relative z-10 py-24">
    <div className="max-w-6xl mx-auto px-6" id="testimonials">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-4"
      >
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => <Star key={i} size={24} className="fill-foreground text-foreground" />)}
        </div>
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4 font-display">Loved by families everywhere</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join thousands of parents who are building stronger bonds with their children.</p>
      </motion.div>
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-sm text-foreground">
          <Star size={14} className="fill-foreground" /> 4.9 out of 5 from 2,000+ reviews
        </span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <ParallaxCard key={t.name} index={i}>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col h-full">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-foreground/60 text-foreground/60" />)}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-foreground/10">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
                  <p className="text-xs text-muted-foreground">Child: {t.childAge}</p>
                </div>
              </div>
            </div>
          </ParallaxCard>
        ))}
      </div>
    </div>
  </ParallaxSection>
);

/* ───── Trust Badges ───── */
const badges = [
  { icon: Shield, label: "Child-Safe Verified", desc: "All caregivers background checked" },
  { icon: Star, label: "4.9★ Average Rating", desc: "From 2,000+ parent reviews" },
  { icon: Award, label: "Award Winning", desc: "Best Parenting App 2025" },
  { icon: Heart, label: "10,000+ Families", desc: "Trust Bondly every day" },
  { icon: CheckCircle, label: "COPPA Compliant", desc: "Children's privacy protected" },
];

const TrustBadges = () => (
  <section className="relative z-10 py-16">
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex flex-wrap justify-center gap-8">
        {badges.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center text-center gap-2 min-w-[140px]"
          >
            <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center">
              <b.icon size={22} className="text-foreground/80" />
            </div>
            <p className="font-semibold text-sm text-foreground">{b.label}</p>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Pricing ───── */
const plans = [
  { name: "Free", price: "$0", period: "forever", description: "Perfect for trying things out", features: ["1 baby profile", "3 AI songs/month", "1 AI story/month", "Basic learning games", "Community support"], featured: false },
  { name: "Pro", price: "$9.99", period: "/month", description: "For growing families", features: ["3 baby profiles", "Unlimited AI songs", "Unlimited stories", "All learning games", "Parenting guides", "Growth tracking", "Priority support"], featured: true },
  { name: "Family", price: "$14.99", period: "/month", description: "The complete experience", features: ["Unlimited profiles", "Everything in Pro", "Custom rhyme videos", "Family sharing", "Offline downloads", "Early feature access", "Dedicated support"], featured: false },
];

const Pricing = () => (
  <ParallaxSection className="relative z-10 py-24">
    <div className="max-w-5xl mx-auto px-6" id="pricing">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4 font-display">Simple, honest pricing</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start free. Upgrade when your family is ready.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {plans.map((plan, i) => (
          <ParallaxCard key={plan.name} index={i}>
            <div className={`rounded-2xl p-8 h-full ${plan.featured ? "liquid-glass border border-foreground/20 shadow-2xl shadow-[hsl(252,80%,65%)]/20" : "liquid-glass"}`}>
              {plan.featured && (
                <span className="inline-block text-xs font-semibold bg-gradient-to-r from-[hsl(252,80%,65%)] to-[hsl(199,89%,60%)] text-foreground rounded-full px-3 py-1 mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-1 font-display">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground font-display">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-foreground/60" /> {f}
                  </li>
                ))}
              </ul>
              <a href={WEB_URL} target="_blank" rel="noopener noreferrer"
                className={`block w-full text-center rounded-full py-3 text-sm text-foreground hover:scale-[1.02] transition-transform ${plan.featured ? "bg-gradient-to-r from-[hsl(252,80%,65%)] to-[hsl(199,89%,60%)]" : "liquid-glass"}`}>
                Get Started
              </a>
            </div>
          </ParallaxCard>
        ))}
      </div>
    </div>
  </ParallaxSection>
);

/* ───── CTA Banner ───── */
const CTABanner = () => (
  <section className="relative z-10 py-24">
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="liquid-glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,80%,65%)]/10 to-[hsl(199,89%,60%)]/10 pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4 font-display relative">
          Ready to start your journey?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto relative">
          Join thousands of parents creating magical moments with their little ones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full px-10 py-4 text-base text-foreground hover:scale-[1.03] transition-transform inline-flex items-center justify-center gap-2">
            <Globe size={18} /> Open in Web
          </a>
          <DownloadDropdown />
        </div>
      </motion.div>
    </div>
  </section>
);

/* ───── Footer ───── */
const Footer = () => (
  <footer className="relative z-10 py-16 border-t border-foreground/10">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍼</span>
            <span className="text-xl text-foreground font-display">Bondly</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered parenting companion for building magical bonds with your little one.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#demo" className="hover:text-foreground transition-colors">Demo</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-foreground/10 pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bondly. All rights reserved.
      </div>
    </div>
  </footer>
);

/* ───── Page ───── */
const Index = () => (
  <div className="relative min-h-screen overflow-hidden bg-background">
    {/* Fullscreen video background */}
    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
      <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
    </video>

    {/* Dark overlay */}
    <div className="absolute inset-0 z-[1] bg-background/70" />

    {/* 3D floating orbs */}
    <Scene3D />

    {/* Content layer */}
    <div className="relative z-10">
      <Navbar />
      <Hero />
      <Features />
      <DemoShowcase />
      <Testimonials />
      <TrustBadges />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  </div>
);

export default Index;
