"use client";
import { useEffect, useRef, useState } from "react";

function useTween(target: number[], ms = 600) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  const key = target.join(",");
  useEffect(() => {
    const from = cur.current.slice();
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const next = target.map((x, i) => (from[i] ?? 0) + (x - (from[i] ?? 0)) * e);
      cur.current = next;
      setV(next);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return v;
}

const C = 110, R = 78;
const ANG = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
const pt = (i: number, val: number) => `${C + Math.cos(ANG[i]!) * R * (val / 4)},${C + Math.sin(ANG[i]!) * R * (val / 4)}`;

/** Animated 3-axis radar. values = [logicalRigor, relevance, resistanceToRebuttal], each 0-4. */
export default function ScoreRadar({ values, labels }: { values: number[]; labels: string[] }) {
  const v = useTween(values);
  return (
    <svg viewBox="0 0 220 220" role="img" aria-label={labels.map((l, i) => `${l} ${values[i]} of 4`).join(", ")} style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }}>
      {[1, 2, 3, 4].map((g) => (
        <polygon key={g} points={[0, 1, 2].map((i) => pt(i, g)).join(" ")} fill="none" stroke="var(--line)" strokeWidth={g === 4 ? 1.5 : 1} />
      ))}
      {[0, 1, 2].map((i) => <line key={i} x1={C} y1={C} x2={pt(i, 4).split(",")[0]} y2={pt(i, 4).split(",")[1]} stroke="var(--line)" />)}
      <polygon points={[0, 1, 2].map((i) => pt(i, v[i] ?? 0)).join(" ")} fill="var(--acc)" fillOpacity={0.22} stroke="var(--acc)" strokeWidth={2} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => {
        const [x, y] = pt(i, v[i] ?? 0).split(",");
        return <circle key={i} cx={x} cy={y} r={4} fill="var(--acc)" />;
      })}
      <text x={C} y={14} textAnchor="middle" fontSize="9" fill="var(--mut)" fontFamily="var(--font-mono)">{labels[0]!.toUpperCase()}</text>
      <text x={206} y={160} textAnchor="end" fontSize="9" fill="var(--mut)" fontFamily="var(--font-mono)">{labels[1]!.toUpperCase()}</text>
      <text x={14} y={160} textAnchor="start" fontSize="9" fill="var(--mut)" fontFamily="var(--font-mono)">{labels[2]!.toUpperCase()}</text>
    </svg>
  );
}
