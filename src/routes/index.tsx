import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, Send, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sections, type Question } from "@/lib/questions";
import { VoiceField } from "@/components/VoiceField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Assistant Personalization Questionnaire" },
      { name: "description", content: "Voice-enabled questionnaire to tailor an AI Executive Assistant to the Executive Minister's way of working." },
      { property: "og:title", content: "Executive Assistant Personalization Questionnaire" },
      { property: "og:description", content: "Answer by typing, ticking or simply speaking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Answer = { text?: string; choices?: string[]; other?: string; explain?: string; explainMode?: boolean; followUp?: string; rating?: number };
type Answers = Record<string, Answer>;
const KEY = "ea-questionnaire-v1";

function Index() {
  const [answers, setAnswers] = useState<Answers>({});
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    try { setAnswers(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(answers)); }, [answers, loaded]);

  const update = (id: string, patch: Partial<Answer>) =>
    setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } }));

  const total = sections.reduce((s, x) => s + x.questions.length, 0);
  const done = Object.values(answers).filter(
    (a) => a.text || a.choices?.length || a.other || a.explain || a.rating,
  ).length;

  const buildText = () => {
    let out = "EXECUTIVE ASSISTANT PERSONALIZATION QUESTIONNAIRE\n\n";
    sections.forEach((s, i) => {
      out += `SECTION ${i + 1} — ${s.title.toUpperCase()}\n\n`;
      s.questions.forEach((q) => {
        const a = answers[q.id] || {};
        out += `${q.n}. ${q.text}\n`;
        if (a.choices?.length) out += `   Selected: ${a.choices.join("; ")}\n`;
        if (a.other) out += `   Other: ${a.other}\n`;
        if (a.rating) out += `   Rating: ${a.rating}/5\n`;
        if (a.text) out += `   Answer: ${a.text}\n`;
        if (a.followUp) out += `   ${q.followUp} ${a.followUp}\n`;
        if (a.explain) out += `   Explanation: ${a.explain}\n`;
        out += "\n";
      });
    });
    return out;
  };

  const submit = async () => {
    setSubmitting(true); setSubmitError("");
    const { error } = await supabase.from("questionnaire_submissions").insert({
      respondent: answers['q1']?.text || null,
      answers: answers as any,
      answers_text: buildText(),
    });
    setSubmitting(false);
    if (error) setSubmitError("Couldn't submit right now. Please check your connection and try again.");
    else { setSubmitted(true); localStorage.removeItem(KEY); }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 font-display text-3xl text-foreground">Thank you</h1>
          <p className="mt-2 text-muted-foreground">Your answers have been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">AI Assistant Bot Training</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">Executive Assistant Personalization Questionnaire</h1>
          <p className="mt-4 max-w-xl opacity-85">
            There are no right or wrong answers — just how you actually work. Type, tick, or tap
            <Mic className="mx-1 inline h-4 w-4" /> to speak. Use “Explain instead” on any question to simply talk it through.
          </p>
          <p className="mt-3 text-sm opacity-70">Submit to save your answers.</p>
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-accent transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className="text-sm text-muted-foreground">{done}/{total}</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-14">
        {sections.map((s, i) => (
          <section key={s.title}>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground/70">Section {i + 1}</p>
            <h2 className="font-display text-3xl text-foreground border-b border-border pb-3">{s.title}</h2>
            <div className="mt-6 space-y-6">
              {s.questions.map((q) => (
                <QuestionCard key={q.id} q={q} a={answers[q.id] || {}} update={(p) => update(q.id, p)} />
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 border-t border-border pt-8">
          <button onClick={submit} disabled={submitting || done === 0} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit questionnaire
          </button>
          <button
            onClick={() => { if (confirm("Clear all answers?")) setAnswers({}); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </main>
    </div>
  );
}

function QuestionCard({ q, a, update }: { q: Question; a: Answer; update: (p: Partial<Answer>) => void }) {
  const toggle = (opt: string) => {
    if (q.type === "single") return update({ choices: a.choices?.[0] === opt ? [] : [opt] });
    const set = new Set(a.choices || []);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    update({ choices: [...set] });
  };
  const isChoice = q.type === "multi" || q.type === "single" || q.type === "rating";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium text-card-foreground">
          <span className="mr-2 text-accent-foreground/60">{q.n}.</span>{q.text}
        </h3>
        {isChoice && (
          <button
            type="button"
            onClick={() => update({ explainMode: !a.explainMode })}
            className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
              a.explainMode ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Mic className="h-3 w-3" /> {a.explainMode ? "Show options" : "Explain instead"}
          </button>
        )}
      </div>
      {q.hint && <p className="mt-1 text-sm text-muted-foreground">{q.hint}</p>}
      {q.type === "multi" && !a.explainMode && <p className="mt-1 text-xs text-muted-foreground">Select all that apply</p>}

      <div className="mt-4 space-y-3">
        {(q.type === "short" || q.type === "paragraph") && (
          <VoiceField value={a.text || ""} onChange={(v) => update({ text: v })} multiline={q.type === "paragraph"} placeholder="Type or tap the mic to speak…" />
        )}

        {isChoice && a.explainMode && (
          <VoiceField value={a.explain || ""} onChange={(v) => update({ explain: v })} multiline autoStart={!a.explain} placeholder="Just explain your answer in your own words…" />
        )}

        {q.type === "rating" && !a.explainMode && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} type="button" onClick={() => update({ rating: r })}
                className={`h-12 w-12 rounded-lg border text-lg font-medium transition ${a.rating === r ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                {r}
              </button>
            ))}
          </div>
        )}

        {(q.type === "multi" || q.type === "single") && !a.explainMode && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options!.map((opt) => {
                const on = a.choices?.includes(opt);
                return (
                  <button key={opt} type="button" onClick={() => toggle(opt)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${on ? "border-primary bg-secondary text-secondary-foreground" : "border-border hover:border-primary/50"}`}>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center border ${q.type === "single" ? "rounded-full" : "rounded"} ${on ? "border-primary bg-primary" : "border-input"}`}>
                      {on && <span className={`h-1.5 w-1.5 bg-primary-foreground ${q.type === "single" ? "rounded-full" : "rounded-sm"}`} />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {q.other && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Other</p>
                <VoiceField value={a.other || ""} onChange={(v) => update({ other: v })} placeholder="Anything else? Type or speak…" />
              </div>
            )}
            {q.followUp && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">{q.followUp}</p>
                <VoiceField value={a.followUp || ""} onChange={(v) => update({ followUp: v })} multiline />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
