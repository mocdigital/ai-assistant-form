import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 13 * 1024 * 1024; // gemini transcribe file cap is 14 MB

// Cross-origin callers (e.g. the Vercel deployment) allowed to use this endpoint.
// Any *.vercel.app origin is allowed; add custom domains via ALLOWED_ORIGINS (comma-separated).
function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  const extra = (process.env['ALLOWED_ORIGINS'] || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  let ok = extra.includes(origin);
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app") || host.endsWith(".lovable.app") || host === "localhost") ok = true;
  } catch {}
  if (!ok) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export const Route = createFileRoute("/api/public/transcribe")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = corsHeaders(request);
        const json = (body: unknown, status: number) => Response.json(body, { status, headers: cors });
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return json({ error: "Transcription is not configured." }, 500);
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_BYTES + 100_000) return json({ error: "Recording is too long." }, 413);

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || !file.size) return json({ error: "No audio received." }, 400);
        if (file.size > MAX_BYTES) return json({ error: "Recording is too long." }, 413);

        const audio = new File([file], file.name || "audio.webm", { type: (file.type || "audio/webm").replace(/^video\//, "audio/") });
        const out = new FormData();
        out.append("model", "google/gemini-3.5-transcribe");
        out.append("file", audio, audio.name);
        out.append("response_format", "json");
        out.append("stream", "true");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: out,
          signal: request.signal,
        });
        return new Response(upstream.body, {
          status: upstream.status,
          headers: { ...cors, "content-type": upstream.headers.get("content-type") || "application/json" },
        });
      },
    },
  },
});
