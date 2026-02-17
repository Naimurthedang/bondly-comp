import InvestorHero from "@/components/investor/InvestorHero";
import InvestmentForm from "@/components/investor/InvestmentForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Invest = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft size={18} /></Button>
          <h1 className="font-display text-xl font-bold text-foreground">Invest in Bondly</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        <InvestorHero />
        <InvestmentForm />
      </main>
    </div>
  );
};

export default Invest;
