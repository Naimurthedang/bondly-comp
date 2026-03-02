import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { event_type, payload, user_id } = await req.json();

    // Find active webhooks for this user/event
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (!webhooks?.length) {
      return new Response(JSON.stringify({ delivered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const matching = webhooks.filter((w: any) => {
      const events = w.events as string[];
      return events.includes(event_type) || events.includes("*");
    });

    let delivered = 0;

    for (const webhook of matching) {
      // HMAC signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhook.secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const body = JSON.stringify({ event: event_type, data: payload, timestamp: Date.now() });
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Bondly-Signature": signature,
          },
          body,
        });

        await supabase.from("webhook_deliveries").insert({
          webhook_id: webhook.id,
          event_type,
          payload: { event: event_type, data: payload },
          response_status: res.status,
          delivered_at: res.ok ? new Date().toISOString() : null,
          failed_at: res.ok ? null : new Date().toISOString(),
          attempt_count: 1,
        });

        if (res.ok) delivered++;
      } catch (err) {
        await supabase.from("webhook_deliveries").insert({
          webhook_id: webhook.id,
          event_type,
          payload: { event: event_type, data: payload },
          response_status: 0,
          response_body: String(err),
          failed_at: new Date().toISOString(),
          attempt_count: 1,
          next_retry_at: new Date(Date.now() + 60000).toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({ delivered, total: matching.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
