"use client";
import type { Fallacy } from "@/types/steelman";

export default function FallacyList({ fallacies, open, onToggle }: { fallacies: Fallacy[]; open: number | null; onToggle: (i: number) => void }) {
  if (!fallacies.length)
    return <p style={{ color: "var(--grn)", margin: 0 }}>✓ No clear named fallacies detected <span style={{ color: "var(--mut)", fontSize: 14 }}>(this does not prove the argument is sound)</span></p>;
  return (
    <div>
      {fallacies.map((f, i) => (
        <div key={i} className={`fal ${open === i ? "open" : ""}`}>
          <button aria-expanded={open === i} onClick={() => onToggle(i)}>
            <span><b>{f.name}</b><span className={`sev ${f.severity}`}>{f.severity}</span></span>
            <span className="mono">{Math.round(f.confidence * 100)}% conf.</span>
          </button>
          {open === i && (
            <div className="body">
              <p style={{ margin: "0 0 6px" }}><em>“{f.excerpt}”</em></p>
              <p style={{ margin: "0 0 6px" }}>{f.explanation}</p>
              <p style={{ margin: "0 0 6px" }}><span className="mono">Why it matters </span><br />{f.whyItMatters}</p>
              <p style={{ margin: 0 }}><span className="mono" style={{ color: "var(--grn)" }}>Repair </span><br />{f.suggestedRepair}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
