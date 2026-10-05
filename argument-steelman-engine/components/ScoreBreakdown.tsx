import type { Stage } from "@/types/steelman";
import ScoreRadar from "./ScoreRadar";

export default function ScoreBreakdown({ score }: { score: Stage["score"] }) {
  const rows = [
    ["Logical rigor", score.logicalRigor],
    ["Relevance", score.relevance],
    ["Rebuttal resistance", score.resistanceToRebuttal],
  ] as const;
  return (
    <div className="card">
      <div className="mono" style={{ marginBottom: 6 }}>Score breakdown</div>
      <ScoreRadar values={rows.map((r) => r[1].score)} labels={["Rigor", "Relevance", "Resistance"]} />
      {rows.map(([label, d]) => (
        <div key={label} style={{ marginTop: 10 }}>
          <div className="flex justify-between" style={{ fontSize: 15 }}><span>{label}</span><b className="tabular-nums">{d.score} / 4</b></div>
          <div className="bar"><i style={{ width: `${d.score * 25}%` }} /></div>
          <p style={{ fontSize: 14, color: "var(--mut)", margin: "3px 0 0" }}>{d.reason}</p>
        </div>
      ))}
      <div className="flex items-baseline justify-between" style={{ borderTop: "1.5px solid var(--ink)", marginTop: 12, paddingTop: 8 }}>
        <span>Total</span><b className="tabular-nums" style={{ fontSize: 30 }}>{score.total} / 12</b>
      </div>
    </div>
  );
}
