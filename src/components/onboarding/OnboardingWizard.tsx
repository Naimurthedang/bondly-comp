import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const parentingGoals = ["Bonding", "Learning", "Sleep Routine", "Emotional Development", "Physical Activity", "Creativity"];
const learningStyles = ["Visual", "Auditory", "Kinesthetic"];

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Baby info
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  // Step 2: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Step 3: Learning style
  const [selectedStyle, setSelectedStyle] = useState("");

  // Step 4: Sleep
  const [bedtime, setBedtime] = useState("19:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [napTime, setNapTime] = useState("13:00");

  const steps = ["Baby Info", "Goals", "Learning", "Sleep"];
  const progress = ((step + 1) / steps.length) * 100;

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]);
  };

  const handleComplete = async () => {
    if (!user || !babyName.trim()) {
      toast({ title: "Error", description: "Please enter a baby name", variant: "destructive" });
      setStep(0);
      return;
    }

    setLoading(true);
    const preferences = {
      goals: selectedGoals,
      learning_style: selectedStyle,
      sleep: { bedtime, wake_time: wakeTime, nap_time: napTime },
    };

    const { error: babyError } = await supabase.from("babies").insert({
      user_id: user.id,
      name: babyName.trim(),
      birth_date: birthDate || null,
      gender: gender || null,
      preferences,
    });

    if (babyError) {
      toast({ title: "Error", description: babyError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    await supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
    setLoading(false);
    onComplete();
  };

  const canProceed = step === 0 ? babyName.trim().length > 0 : true;

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-3xl">🍼</span>
          <h1 className="font-display text-2xl font-bold text-foreground mt-2">Set up your family</h1>
          <p className="text-muted-foreground text-sm mt-1">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        <Progress value={progress} className="mb-8 h-2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-0">
              {step === 0 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-display">Tell us about your baby</CardTitle>
                    <CardDescription>Basic information to personalize the experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="baby-name">Baby's name *</Label>
                      <Input id="baby-name" placeholder="e.g., Emma" value={babyName} onChange={(e) => setBabyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth-date">Birth date</Label>
                      <Input id="birth-date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex gap-2">
                        {["Boy", "Girl", "Other"].map((g) => (
                          <Button key={g} type="button" variant={gender === g ? "default" : "outline"} className="rounded-full flex-1" onClick={() => setGender(g)}>
                            {g}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-display">Parenting goals</CardTitle>
                    <CardDescription>Select what matters most to your family</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {parentingGoals.map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant={selectedGoals.includes(goal) ? "default" : "outline"}
                          className="rounded-full h-auto py-3"
                          onClick={() => toggleGoal(goal)}
                        >
                          {selectedGoals.includes(goal) && <Check size={14} />}
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-display">Learning style</CardTitle>
                    <CardDescription>How does your child learn best?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {learningStyles.map((style) => (
                        <Button
                          key={style}
                          type="button"
                          variant={selectedStyle === style ? "default" : "outline"}
                          className="w-full rounded-full h-auto py-4 justify-start"
                          onClick={() => setSelectedStyle(style)}
                        >
                          {selectedStyle === style && <Check size={16} className="mr-2" />}
                          <div className="text-left">
                            <p className="font-medium">{style}</p>
                            <p className="text-xs opacity-70">
                              {style === "Visual" && "Learns through images and colors"}
                              {style === "Auditory" && "Learns through sounds and music"}
                              {style === "Kinesthetic" && "Learns through touch and movement"}
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-display">Sleep schedule</CardTitle>
                    <CardDescription>Help us time bedtime songs perfectly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedtime">Bedtime</Label>
                      <Input id="bedtime" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wake">Wake time</Label>
                      <Input id="wake" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nap">Nap time</Label>
                      <Input id="nap" type="time" value={napTime} onChange={(e) => setNapTime(e.target.value)} />
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : null} disabled={step === 0} className="gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleComplete} className="gap-2 text-muted-foreground">
              <SkipForward size={16} /> Skip
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed} className="gap-2 rounded-full px-6">
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="gap-2 rounded-full px-6">
                {loading ? "Saving..." : "Complete"} <Check size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
