import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  autoStart?: boolean;
};

// Browser speech recognition (Chrome, Edge, Safari)
function getRecognition(): any {
  if (typeof window === "undefined") return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR ? new SR() : null;
}

export function VoiceField({ value, onChange, multiline, placeholder, autoStart }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef<any>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const start = () => {
    const rec = getRecognition();
    if (!rec) {
      setError("Voice input isn't supported in this browser. Please use Chrome, Edge or Safari.");
      return;
    }
    setError("");
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-GB";
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) {
        const cur = valueRef.current;
        onChange((cur ? cur.trimEnd() + " " : "") + finalText.trim());
      }
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") setError("Microphone access was blocked. Please allow it and try again.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setError("Voice input stopped. Tap the mic to try again.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => recRef.current?.stop();

  useEffect(() => {
    if (autoStart) start();
    return () => recRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shared =
    "w-full rounded-lg border border-input bg-card px-4 py-3 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

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
          onClick={listening ? stop : start}
          aria-label={listening ? "Stop recording" : "Speak your answer"}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full transition ${
            listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>
      {listening && (
        <p className="mt-1 text-sm text-muted-foreground italic">Listening… {interim}</p>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
