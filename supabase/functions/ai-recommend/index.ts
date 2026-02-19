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
  average_rating?: number;
  review_count?: number;
  success_probability?: number;
}

// ============ COLLABORATIVE FILTERING ============
function computeCollaborativeScore(
  caregiverId: string,
  parentId: string,
  allBookings: any[],
  allReviews: any[]
): { score: number; reason: string | null } {
  // Find parents who booked the same caregivers as this parent
  const parentBookedCaregivers = new Set(
    allBookings.filter(b => b.parent_id === parentId).map(b => b.caregiver_id)
  );

  // Find "similar" parents (those who also booked at least one of the same caregivers)
  const similarParents = new Set<string>();
  allBookings.forEach(b => {
    if (b.parent_id !== parentId && parentBookedCaregivers.has(b.caregiver_id)) {
      similarParents.add(b.parent_id);
    }
  });

  // Count how many similar parents booked this caregiver
  const similarParentBookings = allBookings.filter(
    b => similarParents.has(b.parent_id) && b.caregiver_id === caregiverId
  );

  // Get ratings from similar parents for this caregiver
  const similarRatings = allReviews.filter(
    r => similarParents.has(r.reviewer_id) && r.reviewee_id === caregiverId
  );
  const avgSimilarRating = similarRatings.length > 0
    ? similarRatings.reduce((s: number, r: any) => s + r.overall_rating, 0) / similarRatings.length
    : 0;

  if (similarParentBookings.length === 0) return { score: 0, reason: null };

  const score = Math.min(similarParentBookings.length / 3, 1) * 10 +
    (avgSimilarRating > 0 ? (avgSimilarRating / 5) * 5 : 0);

  return {
    score: Math.round(score),
    reason: `Popular with ${similarParentBookings.length} parents like you${avgSimilarRating >= 4 ? ` (avg ${avgSimilarRating.toFixed(1)}★)` : ""}`,
  };
}

// ============ PREDICTIVE SUCCESS ============
function predictSuccess(
  caregiver: CaregiverProfile,
  stats: { avg: number; count: number },
  completedCount: number,
  cancelledCount: number,
  rehireCount: number
): { probability: number; reason: string | null } {
  let score = 50; // baseline

  // Rating impact (+/- 20)
  if (stats.count > 0) {
    score += ((stats.avg - 3) / 2) * 20;
  }

  // Completion reliability (+/- 15)
  const totalSessions = completedCount + cancelledCount;
  if (totalSessions > 0) {
    const completionRate = completedCount / totalSessions;
    score += (completionRate - 0.5) * 30;
    if (completionRate < 0.7) {
      return {
        probability: Math.max(Math.round(score), 10),
        reason: `Completion rate: ${Math.round(completionRate * 100)}%`,
      };
    }
  }

  // Experience boost (+10 max)
  score += Math.min((caregiver.years_experience || 0) / 10, 1) * 10;

  // Rehire signal (+5)
  if (rehireCount >= 2) score += 5;

  const probability = Math.min(Math.max(Math.round(score), 10), 99);
  return {
    probability,
    reason: probability >= 80 ? "High predicted success rate" : null,
  };
}

function computeWeightedScore(
  caregiver: CaregiverProfile,
  preferences: Record<string, unknown> | null,
  avgRating: number,
  reviewCount: number,
  rehireCount: number,
  collaborativeScore: number,
  successProbability: number
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Rating weight (25%)
  if (avgRating > 0) {
    score += (avgRating / 5) * 25;
    if (avgRating >= 4.5) reasons.push(`Exceptional ${avgRating.toFixed(1)}★ rating from ${reviewCount} reviews`);
    else if (avgRating >= 4.0) reasons.push(`Strong ${avgRating.toFixed(1)}★ rating`);
  }

  // Experience (15%)
  const exp = caregiver.years_experience || 0;
  score += Math.min(exp / 10, 1) * 15;
  if (exp >= 5) reasons.push(`${exp} years of childcare experience`);

  // Profile completeness (5%)
  score += (caregiver.profile_completeness / 100) * 5;

  // Rehire frequency (10%)
  score += Math.min(rehireCount / 5, 1) * 10;
  if (rehireCount >= 3) reasons.push("Frequently rehired by parents");

  // Collaborative filtering (15%)
  score += collaborativeScore;

  // Predictive success (10%)
  score += (successProbability / 100) * 10;

  // Budget match (10%)
  if (preferences) {
    const maxRate = preferences.max_hourly_rate as number | undefined;
    if (maxRate && caregiver.hourly_rate <= maxRate) {
      score += 10;
      reasons.push("Within your budget");
    } else if (!maxRate) {
      score += 7;
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
    score += 7;
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

    // Parallel data fetches
    const [prefsRes, cgRes, reviewsRes, allBookingsRes] = await Promise.all([
      userClient.from("parent_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      (() => {
        let q = adminClient.from("caregiver_profiles").select("*").eq("verification_status", "verified");
        if (specialty) q = q.contains("specialties", [specialty]);
        const effectiveRate = max_rate || undefined;
        if (effectiveRate) q = q.lte("hourly_rate", effectiveRate);
        return q;
      })(),
      adminClient.from("reviews").select("reviewee_id, reviewer_id, overall_rating, booking_id"),
      adminClient.from("bookings").select("parent_id, caregiver_id, status"),
    ]);

    const prefs = prefsRes.data;
    const caregivers = cgRes.data;
    if (cgRes.error) throw cgRes.error;
    if (!caregivers?.length) {
      return new Response(JSON.stringify({ recommendations: [], ai_insight: "No caregivers available yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply max rate from prefs if not in request
    let filteredCaregivers = caregivers;
    if (!max_rate && prefs?.max_hourly_rate) {
      filteredCaregivers = caregivers.filter((c: any) => c.hourly_rate <= prefs.max_hourly_rate);
      if (filteredCaregivers.length === 0) filteredCaregivers = caregivers; // fallback
    }

    const reviews = reviewsRes.data || [];
    const allBookings = allBookingsRes.data || [];

    // Compute stats
    const reviewStats: Record<string, { avg: number; count: number }> = {};
    for (const r of reviews) {
      if (!reviewStats[r.reviewee_id]) reviewStats[r.reviewee_id] = { avg: 0, count: 0 };
      reviewStats[r.reviewee_id].count++;
      reviewStats[r.reviewee_id].avg += r.overall_rating;
    }
    for (const key of Object.keys(reviewStats)) {
      reviewStats[key].avg /= reviewStats[key].count;
    }

    const completedByCaregiver: Record<string, number> = {};
    const cancelledByCaregiver: Record<string, number> = {};
    const rehireCounts: Record<string, number> = {};
    for (const b of allBookings) {
      if (b.status === "completed") {
        completedByCaregiver[b.caregiver_id] = (completedByCaregiver[b.caregiver_id] || 0) + 1;
        if (b.parent_id === user.id) {
          rehireCounts[b.caregiver_id] = (rehireCounts[b.caregiver_id] || 0) + 1;
        }
      } else if (b.status === "cancelled") {
        cancelledByCaregiver[b.caregiver_id] = (cancelledByCaregiver[b.caregiver_id] || 0) + 1;
      }
    }

    // Score each caregiver
    const scored: ScoredCaregiver[] = filteredCaregivers.map((cg: any) => {
      const stats = reviewStats[cg.user_id] || { avg: 0, count: 0 };
      const rehires = rehireCounts[cg.user_id] || 0;
      const completed = completedByCaregiver[cg.user_id] || 0;
      const cancelled = cancelledByCaregiver[cg.user_id] || 0;

      const collab = computeCollaborativeScore(cg.user_id, user.id, allBookings, reviews);
      const prediction = predictSuccess(cg as CaregiverProfile, stats, completed, cancelled, rehires);

      const { score, reasons } = computeWeightedScore(
        cg as CaregiverProfile, prefs, stats.avg, stats.count,
        rehires, collab.score, prediction.probability
      );

      if (collab.reason) reasons.push(collab.reason);
      if (prediction.reason) reasons.push(prediction.reason);

      return {
        ...(cg as CaregiverProfile),
        compatibility_score: score,
        match_reasons: reasons,
        is_top_match: false,
        average_rating: stats.avg,
        review_count: stats.count,
        success_probability: prediction.probability,
      };
    });

    scored.sort((a, b) => b.compatibility_score - a.compatibility_score);
    if (scored.length > 0) scored[0].is_top_match = true;
    const topResults = scored.slice(0, limit);

    // AI insight
    let aiInsight = "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && topResults.length > 0) {
      try {
        const topNames = topResults.slice(0, 3).map(c =>
          `${c.full_name} (${c.compatibility_score}% match, $${c.hourly_rate}/hr, ${c.years_experience || 0}y exp, success: ${c.success_probability}%, specialties: ${(c.specialties || []).join(", ")})`
        ).join("\n");

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a helpful parenting assistant. Write a 2-3 sentence personalized recommendation summary for a parent looking for a caregiver. Be warm, concise, and highlight why the top match is great. Mention success probability if high. Do not use markdown." },
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
