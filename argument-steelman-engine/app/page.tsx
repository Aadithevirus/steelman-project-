"use client";
import { useEffect, useRef, useState } from "react";
import { MAX_CLAIM_LENGTH } from "@/lib/schema";
import type { Analysis } from "@/types/steelman";
import AnalysisView from "@/components/AnalysisView";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";

const EXAMPLES = [
  "Remote work makes employees less productive.",
  "Free will is an illusion.",
  "AI will eliminate most programming jobs.",
  "Social media has made society less connected.",
  "College degrees are becoming obsolete.",
];
const FLOW = ["Analyze", "Find fallacies", "Stress test", "Strengthen", "Steelman"];

export default function Home() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Analysis | null>(null);
  const resRef = useRef<HTMLDivElement>(null);

  async function run() {
    if (!claim.trim() || loading) return;
    setLoading(true); setError(null); setData(null);
    try {
      const r = await fetch("/api/steelman", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      setData(j.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally { setLoading(false); }
  }

  useEffect(() => { if (data) resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [data]);

  return (
    <main className="shell">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="mono">Argument Steelman Engine · Proofing Lab</span>
        <span className="mono">Powered by Gemma 4</span>
      </div>
      <h1 style={{ fontSize: "clamp(34px,6vw,62px)", lineHeight: 1.03, fontWeight: 600, margin: "10px 0 12px" }}>
        Don&apos;t just get the strongest argument.<br /><em style={{ color: "var(--acc)", fontWeight: 400 }}>Watch it get sharpened.</em>
      </h1>
      <div className="flow mono" style={{ margin: "14px 0 22px" }}>
        {FLOW.map((f, i) => <span key={f} className="flow"><span className="s">{f}</span>{i < FLOW.length - 1 && "→"}</span>)}
      </div>

      <label htmlFor="claim" className="mono">Your claim or argument</label>
      <textarea id="claim" className="claim-box" value={claim} maxLength={MAX_CLAIM_LENGTH} placeholder="Enter a claim or argument…"
        onChange={(e) => setClaim(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }} />
      <div className="flex flex-wrap gap-2" style={{ margin: "10px 0 16px" }}>
        {EXAMPLES.map((x) => <button key={x} className="chip" onClick={() => setClaim(x)}>{x}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-solid" disabled={loading || !claim.trim()} onClick={run}>{loading ? "Analyzing…" : "Steelman argument"}</button>
        <span className="mono">Ctrl/⌘ + Enter · {claim.length}/{MAX_CLAIM_LENGTH}</span>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <LoadingState />}
      <div ref={resRef}>
        {data && !loading && <AnalysisView key={data.claim + data.stages[0]?.argument} a={data} onRegenerate={run} onReset={() => { setData(null); setClaim(""); setError(null); }} />}
      </div>
    </main>
  );
}
