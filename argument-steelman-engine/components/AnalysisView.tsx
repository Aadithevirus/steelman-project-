"use client";
import { useEffect, useState } from "react";
import type { Analysis } from "@/types/steelman";
import ArgumentStage from "./ArgumentStage";
import FallacyList from "./FallacyList";
import ScoreBreakdown from "./ScoreBreakdown";
import ScoreProgression from "./ScoreProgression";
import ObjectionArena from "./ObjectionArena";
import StageScrubber from "./StageScrubber";

function toText(a: Analysis) {
  return [`Claim: ${a.claim}`, `Type: ${a.claimType}`, `Interpretation: ${a.interpretation}`,
    ...a.stages.map((s) => `\nStage ${s.stage} (${s.title}) ${s.score.total}/12\n${s.argument}\nWeaknesses: ${s.weaknesses.join("; ")}\nObjections: ${s.anticipatedObjections.join("; ")}\nImprovements: ${s.improvements.join("; ")}\nFallacies: ${s.fallacies.map((f) => f.name).join(", ") || "none detected"}`)].join("\n");
}

export default function AnalysisView({ a, onRegenerate, onReset }: { a: Analysis; onRegenerate: () => void; onReset: () => void }) {
  const [idx, setIdx] = useState(a.stages.length);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [copied, setCopied] = useState(false);
  const [origOpen, setOrigOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (idx >= a.stages.length) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx((i) => i + 1), 2600);
    return () => clearTimeout(t);
  }, [playing, idx, a.stages.length]);

  const stage = idx > 0 ? a.stages[idx - 1] : undefined;
  const prev = idx > 1 ? a.stages[idx - 2] : undefined;
  const next = a.stages[idx];

  return (
    <article style={{ marginTop: 36 }}>
      <div className="card">
        <div className="mono">Original claim</div>
        <p style={{ fontSize: 24, margin: "4px 0 10px" }}>{a.claim}</p>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="mono">Claim type</span><b style={{ color: "var(--acc)" }}>{a.claimType.replace("_", " ")}</b>
        </div>
        <p style={{ margin: "8px 0 0", maxWidth: "70ch" }}><span className="mono">Interpreted as </span><br />{a.interpretation}</p>
      </div>

      <StageScrubber a={a} idx={idx} onChange={(i) => { setPlaying(false); setIdx(i); }} playing={playing} onPlay={() => { setIdx(0); setPlaying(true); }} />

      <div className="layout">
        <div>
          {stage ? (
            <ArgumentStage key={stage.stage} label={`Stage ${stage.stage} · ${stage.title}`} text={stage.argument} fallacies={stage.fallacies} prevText={prev?.argument} stage={stage} pulse={pulse} />
          ) : (
            <div className="card">
              <div className="mono" style={{ marginBottom: 8 }}>Fallacies in the original claim · {a.originalAnalysis.fallacies.length || "none"}</div>
              <FallacyList fallacies={a.originalAnalysis.fallacies} open={origOpen} onToggle={(i) => setOrigOpen((o) => (o === i ? null : i))} />
            </div>
          )}
        </div>
        <aside className="aside">
          {stage ? (
            <>
              <ScoreBreakdown score={stage.score} />
<ObjectionArena
  key={stage.stage}
  objections={stage.anticipatedObjections}
  onFire={() => setPulse((p) => p + 1)}
  nextLabel={next ? `Stage ${next.stage}: ${next.title}` : null}
  onNext={() => setIdx(idx + 1)}
  claim={a.claim}
  argument={stage.argument}
/>            </>
          ) : (
            <div className="card"><div className="mono">How to read this</div><p style={{ margin: "6px 0 0", fontSize: 16 }}>Move the slider to Stage 1–3 to watch the counter-argument get rewritten, scored and stress-tested. Each stage builds on the one before.</p></div>
          )}
          <ScoreProgression scores={a.stages.map((s) => s.score.total)} fallacies={a.stages.map((s) => s.fallacies.length)} active={idx} />
        </aside>
      </div>

      <div className="flex flex-wrap gap-3" style={{ marginTop: 26 }}>
        <button className="btn" onClick={() => { navigator.clipboard.writeText(toText(a)); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>{copied ? "Copied" : "Copy full analysis"}</button>
        <button className="btn" onClick={onRegenerate}>Regenerate</button>
        <button className="btn" style={{ borderColor: "var(--line)" }} onClick={onReset}>Clear</button>
      </div>
      <p className="mono" style={{ marginTop: 18, maxWidth: "75ch", textTransform: "none", letterSpacing: 0, fontSize: 12 }}>Model output can be wrong. Fallacy labels are probabilistic, and no detected fallacy does not make an argument sound. Evidence claims need outside verification. This is an analytical aid, not an authority on truth.</p>
    </article>
  );
}
