// Sends a recorded clip to our transcription endpoint and returns the full text.
export async function transcribeBlob(blob: Blob, onPartial?: (t: string) => void): Promise<string> {
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  const type = ((blob.type || "audio/webm").split(";")[0] ?? "audio/webm").replace(/^video\//, "audio/");
  const fd = new FormData();
  fd.append("file", new File([blob], `answer.${ext}`, { type }));
  const res = await fetch("/api/transcribe", { method: "POST", body: fd });

  if (!res.ok) {
    let msg = "Couldn't transcribe the recording. Please try again.";
    try {
      const j = await res.json();
      msg = j?.error?.message || j?.error || j?.message || msg;
    } catch {}
    if (res.status === 429) msg = "Too many requests right now — please wait a moment and try again.";
    if (res.status === 402) msg = "Transcription credits have run out. Please contact the administrator.";
    throw new Error(typeof msg === "string" ? msg : "Transcription failed.");
  }

  if (!(res.headers.get("content-type") || "").includes("event-stream")) {
    const j = await res.json();
    return (j.text || "").trim();
  }

  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let final: string | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const events = buf.split(/\r?\n\r?\n/);
    buf = events.pop() || "";
    for (const ev of events) {
      const data = ev.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
      if (!data || data === "[DONE]") continue;
      try {
        const j = JSON.parse(data);
        if (j.type === "transcript.text.delta" && j.delta) { text += j.delta; onPartial?.(text); }
        else if (j.type === "transcript.text.done") final = j.text ?? text;
        else if (j.error || j.type === "error") throw new Error(j.error?.message || "Transcription failed.");
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("Transcription")) throw e;
      }
    }
  }
  return (final ?? text).trim();
}
