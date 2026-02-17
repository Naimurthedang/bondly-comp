import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  investor_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  firm: z.string().trim().max(200).optional(),
  investment_range: z.string().optional(),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
  nda_requested: z.boolean(),
});

const ranges = ["$25K–$100K", "$100K–$500K", "$500K–$1M", "$1M–$5M", "$5M+"];

const InvestmentForm = () => {
  const [form, setForm] = useState({ investor_name: "", email: "", firm: "", investment_range: "", phone: "", message: "", nda_requested: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.from("investor_inquiries").insert({
      investor_name: form.investor_name.trim(),
      email: form.email.trim(),
      firm: form.firm.trim() || null,
      investment_range: form.investment_range || null,
      phone: form.phone.trim() || null,
      message: form.message.trim() || null,
      nda_requested: form.nda_requested,
    });
    setLoading(false);
    if (error) { toast.error("Failed to submit. Please try again."); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-primary" />
          <h3 className="font-display text-xl font-bold text-foreground">Thank You!</h3>
          <p className="text-muted-foreground">We've received your inquiry and will be in touch within 48 hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader><CardTitle className="font-display">Investment Inquiry</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input value={form.investor_name} onChange={(e) => setForm({ ...form, investor_name: e.target.value })} />
            {errors.investor_name && <p className="text-xs text-destructive">{errors.investor_name}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Firm / Company</Label>
            <Input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Investment Range</Label>
          <Select value={form.investment_range} onValueChange={(v) => setForm({ ...form, investment_range: v })}>
            <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>{ranges.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Message</Label>
          <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your investment thesis..." />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.nda_requested} onCheckedChange={(v) => setForm({ ...form, nda_requested: v })} />
          <Label>Request NDA before sharing details</Label>
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Inquiry"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InvestmentForm;
