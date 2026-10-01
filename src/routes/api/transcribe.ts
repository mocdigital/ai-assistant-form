import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 13 * 1024 * 1024; // gemini transcribe file cap is 14 MB

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ error: "Transcription is not configured." }, { status: 500 });
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_BYTES + 100_000) return Response.json({ error: "Recording is too long." }, { status: 413 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || !file.size) return Response.json({ error: "No audio received." }, { status: 400 });
        if (file.size > MAX_BYTES) return Response.json({ error: "Recording is too long." }, { status: 413 });

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
          headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
        });
      },
    },
  },
});
