export default function ScoreProgression({ scores, fallacies, active }: { scores: number[]; fallacies: number[]; active: number }) {
  const maxF = Math.max(1, ...fallacies);
  return (
    <div className="card">
      <div className="mono">Score by stage · actual values</div>
      <div className="spark" aria-label={`Scores ${scores.join(", ")}`}>
        {scores.map((s, i) => <div key={i} style={{ height: `${(s / 12) * 100}%`, opacity: active === i + 1 ? 1 : 0.35 }}><span>{s}</span></div>)}
      </div>
      <div className="mono" style={{ marginTop: 18 }}>Fallacies by stage</div>
      <div className="spark f" aria-label={`Fallacies ${fallacies.join(", ")}`}>
        {fallacies.map((n, i) => <div key={i} style={{ height: `${(n / maxF) * 100}%`, opacity: active === i + 1 ? 1 : 0.35 }}><span>{n}</span></div>)}
      </div>
      <p className="mono" style={{ marginTop: 8, textTransform: "none", letterSpacing: 0 }}>Shown exactly as returned. Scores can fall as well as rise.</p>
    </div>
  );
}
