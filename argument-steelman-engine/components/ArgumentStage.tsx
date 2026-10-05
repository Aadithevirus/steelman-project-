"use client";
import { useState } from "react";
import type { Fallacy, Stage } from "@/types/steelman";
import { wordDiff } from "@/lib/diff";
import FallacyList from "./FallacyList";

type Props = { label: string; text: string; fallacies: Fallacy[]; prevText?: string; stage?: Stage; pulse: number };

function marked(text: string, fs: Fallacy[], open: number | null, pick: (i: number) => void) {
  const rs: { s: number; e: number; i: number }[] = [];
  fs.forEach((f, i) => {
    const x = f.excerpt.trim();
    const k = x.length > 3 ? text.toLowerCase().indexOf(x.toLowerCase()) : -1;
    if (k >= 0) rs.push({ s: k, e: k + x.length, i });
  });
  rs.sort((a, b) => a.s - b.s);
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const r of rs) {
    if (r.s < at) continue;
    out.push(text.slice(at, r.s));
    out.push(<button key={r.i} className={`fmark ${open === r.i ? "act" : ""}`} onClick={() => pick(r.i)} title="Open fallacy">{text.slice(r.s, r.e)}</button>);
    at = r.e;
  }
  out.push(text.slice(at));
  return { nodes: out, found: rs.length };
}

const List = ({ title, items, tone }: { title: string; items: string[]; tone?: string }) => (
  <div className="col">
    <div className="col-t" style={tone ? { color: tone, borderColor: tone } : undefined}>{title}</div>
    {items.length ? <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p style={{ fontSize: 15, color: "var(--mut)", margin: 0 }}>None recorded.</p>}
  </div>
);

export default function ArgumentStage({ label, text, fallacies, prevText, stage, pulse }: Props) {
  const [mode, setMode] = useState<"diff" | "fallacy">(prevText ? "diff" : "fallacy");
  const [open, setOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const toggle = (i: number) => setOpen((o) => (o === i ? null : i));
  const diff = prevText ? wordDiff(prevText, text) : null;
  const kept = diff ? Math.round((diff.filter((t) => !t.add).length / Math.max(1, diff.length)) * 100) : null;
  const m = marked(text, fallacies, open, toggle);
  const useDiff = mode === "diff" && diff;

  return (
    <div>
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="mono">{label}</span>
          <span className="flex items-center gap-2">
            {prevText && (
              <span className="seg" role="group" aria-label="Highlight mode">
                <button aria-pressed={mode === "diff"} onClick={() => setMode("diff")}>Changes</button>
                <button aria-pressed={mode === "fallacy"} onClick={() => setMode("fallacy")}>Fallacies</button>
              </span>
            )}
            <button className="btn" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? "Copied" : "Copy"}</button>
          </span>
        </div>
        <p key={pulse} className={`arg ${pulse ? "shake" : ""}`} style={{ margin: "12px 0 0" }}>
          {useDiff ? diff.map((t, i) => <span key={i} className={t.add ? "add" : ""}>{t.w}{" "}</span>) : m.nodes}
        </p>
        <p className="mono" style={{ marginTop: 12, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>
          {useDiff ? `Green = wording new in this stage · ${kept}% of the words carried over from the previous stage.`
            : m.found ? "Red wavy underline = text flagged as a fallacy · click to open." : fallacies.length ? "Flagged excerpts could not be matched verbatim in this text; see the list below." : "No fallacy marks in this text."}
        </p>
      </div>

      {stage && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="grid gap-5 md:grid-cols-3">
            <List title={stage.stage === 1 ? "What limits this draft" : "What was weak"} items={stage.weaknesses} tone="var(--red)" />
            <List title="Opposing side could say" items={stage.anticipatedObjections} />
            <List title="How it improved" items={stage.improvements} tone="var(--grn)" />
          </div>
          {stage.requiresExternalEvidence && (
            <div style={{ marginTop: 16, borderLeft: "3px solid var(--hl)", paddingLeft: 12 }}>
              <div className="mono">requiresExternalEvidence · true</div>
              <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 16 }}>{stage.evidenceRequirements.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="mono" style={{ marginBottom: 8 }}>Logical fallacies · {fallacies.length ? `${fallacies.length} detected` : "none detected"}</div>
        <FallacyList fallacies={fallacies} open={open} onToggle={toggle} />
        <p className="mono" style={{ marginTop: 10, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>Labels are probabilistic. A missing label never proves an argument is sound.</p>
      </div>
    </div>
  );
}
