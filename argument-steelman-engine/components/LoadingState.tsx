"use client";
import { useEffect, useState } from "react";
const STEPS = ["Interpreting claim", "Analyzing fallacies", "Building baseline", "Identifying weaknesses", "Strengthening argument", "Testing against objections", "Generating steelman", "Final fallacy check"];

export default function LoadingState() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => Math.min(n + 1, STEPS.length - 1)), 4000); return () => clearInterval(t); }, []);
  return (
    <div className="card" style={{ marginTop: 32 }} role="status" aria-live="polite">
      <div className="mono" style={{ marginBottom: 12 }}>Analytical pipeline</div>
      <div className="rail">
        {STEPS.map((s, n) => <div key={s} className={`st ${n < i ? "done" : n === i ? "on" : ""}`}><span className="mono" style={{ color: n === i ? "var(--acc)" : undefined }}>{s}</span></div>)}
      </div>
      <p className="mono" style={{ marginTop: 14, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>Progress display only. The analysis runs as one request and can take up to a minute.</p>
    </div>
  );
}
