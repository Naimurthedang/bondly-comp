import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="py-16 bg-foreground text-background">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍼</span>
            <span className="font-display text-xl font-bold">Bondly</span>
          </div>
          <p className="text-sm text-background/60 leading-relaxed">
            AI-powered parenting companion for building magical bonds with your little one.
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-background/60">
            <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-background transition-colors">Pricing</a></li>
            <li><a href="#demo" className="hover:text-background transition-colors">Demo</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-background/60">
            <li><a href="#" className="hover:text-background transition-colors">About</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-background/60">
            <li><a href="#" className="hover:text-background transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 pt-8 text-center text-sm text-background/40">
        © {new Date().getFullYear()} Bondly. All rights reserved.
      </div>
    </div>
  </footer>
);
