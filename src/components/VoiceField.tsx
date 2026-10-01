import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { transcribeBlob } from "@/lib/transcribe-client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  autoStart?: boolean;
};

type Status = "idle" | "recording" | "transcribing";

export function VoiceField({ value, onChange, multiline, placeholder, autoStart }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async () => {
    setError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        cleanup();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size < 1000) { setStatus("idle"); setError("Recording was too short — please try again."); return; }
        setStatus("transcribing");
        try {
          const text = await transcribeBlob(blob, setPartial);
          if (text) {
            const cur = valueRef.current;
            onChangeRef.current((cur ? cur.trimEnd() + " " : "") + text);
          } else setError("No speech was detected. Please try again.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Transcription failed.");
        } finally {
          setPartial("");
          setStatus("idle");
        }
      };
      recRef.current = rec;
      rec.start(1000);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => {
        if (s + 1 >= 600) rec.state === "recording" && rec.stop(); // 10 min cap
        return s + 1;
      }), 1000);
      setStatus("recording");
    } catch (e: any) {
      cleanup();
      setError(e?.name === "NotAllowedError" ? "Microphone access was blocked. Please allow it and try again." : "Couldn't start the microphone.");
    }
  };

  const stop = () => { if (recRef.current?.state === "recording") recRef.current.stop(); };

  useEffect(() => {
    if (autoStart) start();
    return () => {
      if (recRef.current?.state === "recording") { recRef.current.onstop = null; recRef.current.stop(); }
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shared =
    "w-full rounded-lg border border-input bg-card px-4 py-3 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div>
      <div className="relative">
        {multiline ? (
          <textarea rows={4} className={shared} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input className={shared} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        )}
        <button
          type="button"
          disabled={status === "transcribing"}
          onClick={status === "recording" ? stop : start}
          aria-label={status === "recording" ? "Stop and transcribe" : "Record your answer"}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-60 ${
            status === "recording" ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {status === "recording" ? <Square className="h-4 w-4" /> : status === "transcribing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>
      {status === "recording" && (
        <p className="mt-1 text-sm text-destructive">● Recording {mm} — tap the square to stop and transcribe</p>
      )}
      {status === "transcribing" && (
        <p className="mt-1 text-sm italic text-muted-foreground">Transcribing… {partial}</p>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
