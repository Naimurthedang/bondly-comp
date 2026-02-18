import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CaregiverProfile {
  id: string;
  user_id: string;
  full_name: string;
  hourly_rate: number;
  years_experience: number | null;
  specialties: string[] | null;
  bio: string | null;
  languages: string[] | null;
  availability: Record<string, unknown> | null;
  profile_completeness: number;
  verification_status: string;
  avatar_url: string | null;
}

interface ScoredCaregiver extends CaregiverProfile {
  compatibility_score: number;
  match_reasons: string[];
  is_top_match: boolean;
}

function computeWeightedScore(
  caregiver: CaregiverProfile,
  preferences: Record<string, unknown> | null,
  avgRating: number,
  reviewCount: number,
  rehireCount: number
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Rating weight (30%)
  if (avgRating > 0) {
    const ratingScore = (avgRating / 5) * 30;
    score += ratingScore;
    if (avgRating >= 4.5) reasons.push(`Exceptional ${avgRating.toFixed(1)}★ rating from ${reviewCount} reviews`);
    else if (avgRating >= 4.0) reasons.push(`Strong ${avgRating.toFixed(1)}★ rating`);
  }

  // Experience (20%)
  const exp = caregiver.years_experience || 0;
  const expScore = Math.min(exp / 10, 1) * 20;
  score += expScore;
  if (exp >= 5) reasons.push(`${exp} years of childcare experience`);

  // Profile completeness (10%)
  score += (caregiver.profile_completeness / 100) * 10;

  // Rehire frequency (15%)
  const rehireScore = Math.min(rehireCount / 5, 1) * 15;
  score += rehireScore;
  if (rehireCount >= 3) reasons.push("Frequently rehired by parents");

  // Budget match (15%)
  if (preferences) {
    const maxRate = preferences.max_hourly_rate as number | undefined;
    if (maxRate && caregiver.hourly_rate <= maxRate) {
      score += 15;
      reasons.push("Within your budget");
    } else if (!maxRate) {
      score += 10;
    }

    // Specialty match (10%)
    const prefSpecialties = (preferences.preferred_specialties as string[]) || [];
    const caregiverSpecs = caregiver.specialties || [];
    const matchCount = prefSpecialties.filter(s => caregiverSpecs.includes(s)).length;
    if (matchCount > 0) {
      score += (matchCount / Math.max(prefSpecialties.length, 1)) * 10;
      reasons.push(`Matches ${matchCount} of your preferred specialties`);
    }
  } else {
    score += 10; // No preferences = no penalty
  }

  return { score: Math.round(score), reasons };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 10, specialty, max_rate } = await req.json().catch(() => ({}));

    // Fetch parent preferences
    const { data: prefs } = await userClient.from("parent_preferences").select("*").eq("user_id", user.id).maybeSingle();

    // Fetch verified caregivers
    let cgQuery = adminClient.from("caregiver_profiles").select("*").eq("verification_status", "verified");
    if (specialty) cgQuery = cgQuery.contains("specialties", [specialty]);
    if (max_rate || prefs?.max_hourly_rate) {
      cgQuery = cgQuery.lte("hourly_rate", max_rate || prefs?.max_hourly_rate);
    }
    const { data: caregivers, error: cgError } = await cgQuery;
    if (cgError) throw cgError;
    if (!caregivers?.length) {
      return new Response(JSON.stringify({ recommendations: [], ai_insight: "No caregivers available yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch review stats per caregiver
    const cgUserIds = caregivers.map(c => c.user_id);
    const { data: reviews } = await adminClient.from("reviews").select("reviewee_id, overall_rating, booking_id");

    // Fetch rehire counts from bookings
    const { data: bookings } = await adminClient.from("bookings")
      .select("parent_id, caregiver_id, status")
      .eq("parent_id", user.id)
      .eq("status", "completed");

    const reviewStats: Record<string, { avg: number; count: number }> = {};
    if (reviews) {
      for (const r of reviews) {
        if (!reviewStats[r.reviewee_id]) reviewStats[r.reviewee_id] = { avg: 0, count: 0 };
        reviewStats[r.reviewee_id].count++;
        reviewStats[r.reviewee_id].avg += r.overall_rating;
      }
      for (const key of Object.keys(reviewStats)) {
        reviewStats[key].avg = reviewStats[key].avg / reviewStats[key].count;
      }
    }

    const rehireCounts: Record<string, number> = {};
    if (bookings) {
      for (const b of bookings) {
        rehireCounts[b.caregiver_id] = (rehireCounts[b.caregiver_id] || 0) + 1;
      }
    }

    // Score caregivers
    const scored: ScoredCaregiver[] = caregivers.map(cg => {
      const stats = reviewStats[cg.user_id] || { avg: 0, count: 0 };
      const rehires = rehireCounts[cg.user_id] || 0;
      const { score, reasons } = computeWeightedScore(cg as CaregiverProfile, prefs, stats.avg, stats.count, rehires);
      return {
        ...(cg as CaregiverProfile),
        compatibility_score: score,
        match_reasons: reasons,
        is_top_match: false,
        average_rating: stats.avg,
        review_count: stats.count,
      };
    });

    scored.sort((a, b) => b.compatibility_score - a.compatibility_score);
    if (scored.length > 0) scored[0].is_top_match = true;
    const topResults = scored.slice(0, limit);

    // Generate AI insight using Lovable AI
    let aiInsight = "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && topResults.length > 0) {
      try {
        const topNames = topResults.slice(0, 3).map(c =>
          `${c.full_name} (${c.compatibility_score}% match, $${c.hourly_rate}/hr, ${c.years_experience || 0}y exp, specialties: ${(c.specialties || []).join(", ")})`
        ).join("\n");

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a helpful parenting assistant. Write a 2-3 sentence personalized recommendation summary for a parent looking for a caregiver. Be warm, concise, and highlight why the top match is great. Do not use markdown." },
              { role: "user", content: `Here are the top caregiver matches:\n${topNames}\n\nParent preferences: ${JSON.stringify(prefs || "none specified")}` },
            ],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiInsight = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI insight error:", e);
      }
    }

    // Log recommendations
    for (const r of topResults.slice(0, 5)) {
      await userClient.from("recommendation_logs").insert({
        parent_id: user.id,
        caregiver_id: r.user_id,
        compatibility_score: r.compatibility_score,
        match_reasons: r.match_reasons,
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ recommendations: topResults, ai_insight: aiInsight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
