import { Music, BookOpen, Puzzle, Heart, Film, TrendingUp, Star, Shield, Award, CheckCircle, Check, Play, ArrowRight, Smartphone, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const WEB_URL = "https://bondly-web-version.lovable.app";
const APK_URL = "https://bondly-web-version.lovable.app";

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
    <nav className="relative z-10 flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
      <a href="#" className="flex items-center gap-2">
        <span className="text-2xl">🍼</span>
        <span className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Bondly<sup className="text-xs">®</sup>
        </span>
      </a>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((l) => (
          <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {l.label}
          </a>
        ))}
      </div>

      <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer">
        Begin Journey
      </a>

      <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 liquid-glass p-6 flex flex-col gap-4 md:hidden">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground text-center">
            Begin Journey
          </a>
        </div>
      )}
    </nav>
  );
};

/* ───── Hero ───── */
const Hero = () => (
  <section className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-40 md:py-[90px]">
    <h1
      className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise"
      style={{ fontFamily: "'Instrument Serif', serif" }}
    >
      Build magical <em className="not-italic text-muted-foreground">bonds</em>
      <br />
      with your <em className="not-italic text-muted-foreground">little one.</em>
    </h1>

    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
      AI-powered bedtime songs, storybooks, learning games, and parenting guidance — all personalized for your baby's unique personality.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-rise-delay-2">
      <a href={WEB_URL} target="_blank" rel="noopener noreferrer"
        className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform cursor-pointer inline-flex items-center gap-3">
        <Globe size={20} /> Open in Web
      </a>
      <a href={APK_URL} target="_blank" rel="noopener noreferrer"
        className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform cursor-pointer inline-flex items-center gap-3">
        <Smartphone size={20} /> Download App
      </a>
    </div>
  </section>
);

/* ───── Features ───── */
const features = [
  { icon: Music, title: "AI Bedtime Songs", description: "Personalized lullabies crafted just for your baby's name and preferences." },
  { icon: BookOpen, title: "AI Storybooks", description: "Beautiful illustrated stories featuring your child as the hero." },
  { icon: Puzzle, title: "Learning Puzzles", description: "Age-appropriate games that grow with your child's development." },
  { icon: Heart, title: "Parenting Guide", description: "Expert AI guidance for every milestone and challenge." },
  { icon: Film, title: "Rhymes Videos", description: "Animated nursery rhymes customized for engagement." },
  { icon: TrendingUp, title: "Growth Tracking", description: "Monitor milestones and celebrate every achievement." },
];

const Features = () => (
  <section id="features" className="relative z-10 py-24">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Everything your family needs
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Six powerful AI features designed to strengthen the bond between you and your baby.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="liquid-glass rounded-2xl p-6 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center mb-4">
              <f.icon size={22} className="text-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── Demo ───── */
const DemoShowcase = () => (
  <section id="demo" className="relative z-10 py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          See it in action
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A sneak peek at what Bondly creates for your family.</p>
      </div>
      <div className="liquid-glass rounded-2xl p-2 md:p-4">
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
      </div>
    </div>
  </section>
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
  <section id="testimonials" className="relative z-10 py-24">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-4">
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => <Star key={i} size={24} className="fill-foreground text-foreground" />)}
        </div>
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Loved by families everywhere
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of parents who are building stronger bonds with their children.
        </p>
      </div>
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-sm text-foreground">
          <Star size={14} className="fill-foreground" /> 4.9 out of 5 from 2,000+ reviews
        </span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="liquid-glass rounded-2xl p-6 flex flex-col">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-foreground/60 text-foreground/60" />)}
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
        ))}
      </div>
    </div>
  </section>
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
        {badges.map((b) => (
          <div key={b.label} className="flex flex-col items-center text-center gap-2 min-w-[140px]">
            <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center">
              <b.icon size={22} className="text-foreground/80" />
            </div>
            <p className="font-semibold text-sm text-foreground">{b.label}</p>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </div>
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
  <section id="pricing" className="relative z-10 py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Simple, honest pricing
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start free. Upgrade when your family is ready.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-8 ${plan.featured ? "liquid-glass border border-foreground/20 scale-105" : "liquid-glass"}`}>
            <h3 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>{plan.price}</span>
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
              className="block w-full text-center liquid-glass rounded-full py-3 text-sm text-foreground hover:scale-[1.02] transition-transform">
              Get Started
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ───── CTA Banner ───── */
const CTABanner = () => (
  <section className="relative z-10 py-24">
    <div className="max-w-4xl mx-auto px-6">
      <div className="liquid-glass rounded-3xl p-12 md:p-16 text-center">
        <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Ready to start your journey?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Join thousands of parents creating magical moments with their little ones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full px-10 py-4 text-base text-foreground hover:scale-[1.03] transition-transform inline-flex items-center justify-center gap-2">
            <Globe size={18} /> Open in Web
          </a>
          <a href={APK_URL} target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full px-10 py-4 text-base text-foreground hover:scale-[1.03] transition-transform inline-flex items-center justify-center gap-2">
            <Smartphone size={18} /> Download App
          </a>
        </div>
      </div>
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
            <span className="text-xl text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>Bondly</span>
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
  <div className="relative min-h-screen overflow-hidden bg-[hsl(201,100%,13%)]">
    {/* Fullscreen video background */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
    </video>

    {/* Dark overlay for readability */}
    <div className="absolute inset-0 z-[1] bg-[hsl(201,100%,13%)]/70" />

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
