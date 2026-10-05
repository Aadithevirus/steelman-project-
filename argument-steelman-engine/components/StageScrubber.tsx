"use client";
import type { Analysis } from "@/types/steelman";

export default function StageScrubber({ a, idx, onChange, playing, onPlay }: { a: Analysis; idx: number; onChange: (i: number) => void; playing: boolean; onPlay: () => void }) {
  const totals = a.stages.map((s) => s.score.total);
  return (
    <div style={{ margin: "26px 0 18px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span className="mono">Argument progression · drag or click</span>
        <button className="btn" onClick={onPlay} disabled={playing}>{playing ? "Playing…" : "▶ Replay the sharpening"}</button>
      </div>
      <div className="nodes">
        <button className={`node ${idx === 0 ? "sel" : ""}`} onClick={() => onChange(0)}>
          <span className="mono">Input</span><b>{a.originalAnalysis.fallacies.length}<small style={{ fontSize: 13 }}> flags</small></b><span className="mono">Original claim</span>
        </button>
        {a.stages.map((s, i) => {
          const d = i > 0 ? s.score.total - totals[i - 1]! : null;
          return (
            <button key={s.stage} className={`node ${idx === s.stage ? "sel" : ""}`} onClick={() => onChange(s.stage)}>
              <span className="mono">Stage {s.stage}</span>
              <b>{s.score.total}<small style={{ fontSize: 13 }}>/12</small>{d !== null && d !== 0 && <small className={d > 0 ? "delta-up" : "delta-dn"} style={{ fontSize: 13, marginLeft: 6 }}>{d > 0 ? "▲" : "▼"}{Math.abs(d)}</small>}</b>
              <span className="mono">{s.title}</span>
            </button>
          );
        })}
      </div>
      <input type="range" min={0} max={3} step={1} value={idx} onChange={(e) => onChange(+e.target.value)} aria-label="Refinement stage" />
    </div>
  );
}
