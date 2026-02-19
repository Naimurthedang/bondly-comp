import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Distress keywords for chat monitoring
const DISTRESS_KEYWORDS = [
  "help", "emergency", "hurt", "scared", "danger", "abuse",
  "bleeding", "unconscious", "not breathing", "choking", "fever",
  "accident", "fallen", "broken", "ambulance", "police", "fire",
  "missing", "lost", "panic", "please help", "call 911",
];

function detectDistress(message: string): { detected: boolean; keywords: string[] } {
  const lower = message.toLowerCase();
  const found = DISTRESS_KEYWORDS.filter(kw => lower.includes(kw));
  return { detected: found.length >= 1, keywords: found };
}

function checkGeofence(
  lat: number, lng: number,
  zoneLat: number, zoneLng: number, radiusMeters: number
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat - zoneLat) * Math.PI / 180;
  const dLng = (lng - zoneLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(zoneLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return distance <= radiusMeters;
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

    const body = await req.json();
    const { action } = body;

    switch (action) {
      // ============ PANIC BUTTON ============
      case "panic": {
        const { booking_id, latitude, longitude } = body;
        // Create critical incident
        const { data: incident, error } = await adminClient.from("safety_incidents").insert({
          booking_id,
          reported_by: user.id,
          incident_type: "panic_button",
          severity: "critical",
          status: "open",
          description: "Panic button activated",
          location_lat: latitude,
          location_lng: longitude,
          parent_notified_at: new Date().toISOString(),
          admin_escalated_at: new Date().toISOString(),
        }).select().single();
        if (error) throw error;

        // Notify emergency contacts
        const { data: contacts } = await adminClient.from("emergency_contacts")
          .select("*").eq("parent_id", user.id).eq("notify_on_incidents", true);

        if (contacts?.length) {
          await adminClient.from("safety_incidents").update({
            emergency_contact_notified_at: new Date().toISOString(),
            metadata: { emergency_contacts_notified: contacts.map(c => c.name) },
          }).eq("id", incident.id);
        }

        return new Response(JSON.stringify({ incident, contacts_notified: contacts?.length || 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ SESSION CHECK-IN ============
      case "checkin": {
        const { booking_id, check_type, latitude, longitude, address, notes } = body;

        // Check geofence
        let withinGeofence = true;
        if (latitude && longitude) {
          const { data: booking } = await adminClient.from("bookings")
            .select("parent_id").eq("id", booking_id).single();
          if (booking) {
            const { data: zones } = await adminClient.from("geofence_zones")
              .select("*").eq("parent_id", booking.parent_id).eq("is_active", true);
            if (zones?.length) {
              withinGeofence = zones.some(z =>
                checkGeofence(latitude, longitude, Number(z.latitude), Number(z.longitude), z.radius_meters)
              );
              if (!withinGeofence) {
                await adminClient.from("safety_incidents").insert({
                  booking_id,
                  reported_by: user.id,
                  incident_type: "geo_fence_breach",
                  severity: "high",
                  description: `Caregiver left geofence zone during ${check_type}`,
                  location_lat: latitude,
                  location_lng: longitude,
                  parent_notified_at: new Date().toISOString(),
                });
              }
            }
          }
        }

        const { data: checkin, error } = await userClient.from("session_checkins").insert({
          booking_id, caregiver_id: user.id, check_type,
          latitude, longitude, address, notes,
          is_within_geofence: withinGeofence,
        }).select().single();
        if (error) throw error;

        return new Response(JSON.stringify({ checkin, within_geofence: withinGeofence }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ CHAT DISTRESS DETECTION ============
      case "scan_message": {
        const { message, booking_id } = body;
        const result = detectDistress(message);

        if (result.detected) {
          await adminClient.from("safety_incidents").insert({
            booking_id,
            reported_by: user.id,
            incident_type: "distress_keyword",
            severity: result.keywords.length >= 3 ? "critical" : "high",
            description: `Distress keywords detected: ${result.keywords.join(", ")}`,
            metadata: { keywords: result.keywords, original_message: message },
            parent_notified_at: new Date().toISOString(),
          });
        }

        return new Response(JSON.stringify({ distress_detected: result.detected, keywords: result.keywords }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ WELLBEING REPORT (AI-GENERATED SUMMARY) ============
      case "wellbeing_report": {
        const { booking_id, child_id, mood_rating, care_notes, meals_log, sleep_log, activities, incidents } = body;

        let aiSummary = "";
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          try {
            const prompt = `Summarize this childcare session in 2-3 warm sentences for a parent:
Mood: ${mood_rating}/5
Notes: ${care_notes || "None"}
Meals: ${JSON.stringify(meals_log || [])}
Sleep: ${JSON.stringify(sleep_log || {})}
Activities: ${JSON.stringify(activities || [])}
Incidents: ${incidents || "None"}`;

            const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: "You are a caring childcare assistant. Write warm, reassuring summaries for parents about their child's day. Be concise and positive. No markdown." },
                  { role: "user", content: prompt },
                ],
              }),
            });
            if (aiResp.ok) {
              const data = await aiResp.json();
              aiSummary = data.choices?.[0]?.message?.content || "";
            }
          } catch (e) {
            console.error("AI summary error:", e);
          }
        }

        const { data: report, error } = await userClient.from("wellbeing_reports").insert({
          booking_id, caregiver_id: user.id, child_id,
          mood_rating, care_notes, meals_log: meals_log || [],
          sleep_log: sleep_log || {}, activities: activities || [],
          incidents, overall_summary: care_notes,
          ai_generated_summary: aiSummary,
        }).select().single();
        if (error) throw error;

        return new Response(JSON.stringify({ report }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ GET SAFETY DASHBOARD DATA ============
      case "dashboard": {
        const [incidentsRes, checkinsRes, reportsRes] = await Promise.all([
          adminClient.from("safety_incidents").select("*").order("created_at", { ascending: false }).limit(50),
          adminClient.from("session_checkins").select("*").order("created_at", { ascending: false }).limit(50),
          adminClient.from("wellbeing_reports").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

        return new Response(JSON.stringify({
          incidents: incidentsRes.data || [],
          checkins: checkinsRes.data || [],
          reports: reportsRes.data || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("safety-monitor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
