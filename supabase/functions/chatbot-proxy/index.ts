import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENT_BASE = "https://agents.toolhouse.ai/ff6bbcf6-986e-4d24-9887-d01639e1ca8d";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, runId } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = runId ? `${AGENT_BASE}/${runId}` : AGENT_BASE;
    const method = runId ? "PUT" : "POST";

    const upstream = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const newRunId = upstream.headers.get("x-toolhouse-run-id") || runId || "";

    if (!upstream.body) {
      const text = await upstream.text();
      return new Response(JSON.stringify({ content: text, runId: newRunId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Send runId as first chunk
    writer.write(encoder.encode(`data: ${JSON.stringify({ runId: newRunId })}\n\n`));

    (async () => {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
        }
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        await writer.write(encoder.encode("data: [DONE]\n\n"));
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
