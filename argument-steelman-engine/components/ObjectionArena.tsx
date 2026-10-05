"use client";

import { useState } from "react";

type ChallengeResult = {
  objectionStrength: number;
  vulnerability: string;
  response: string;
  repairedArgument: string;
  requiresExternalEvidence: boolean;
  evidenceRequirements: string[];
  evaluation: {
    logicalRigor: {
      score: number;
      reason: string;
    };
    relevance: {
      score: number;
      reason: string;
    };
    resistanceToRebuttal: {
      score: number;
      reason: string;
    };
  };
};

type Props = {
  objections: string[];
  onFire: () => void;
  nextLabel: string | null;
  onNext: () => void;

  // New information needed by Gemma
  claim: string;
  argument: string;
};

export default function ObjectionArena({
  objections,
  onFire,
  nextLabel,
  onNext,
  claim,
  argument,
}: Props) {
  const [fired, setFired] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<number | null>(null);
  const [challenge, setChallenge] = useState<ChallengeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function challengeObjection(objection: string, index: number) {
    setLoading(index);
    setChallenge(null);
    setError(null);

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claim,
          argument,
          objection,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "The AI challenge could not be completed."
        );
      }

      setChallenge(result.data);

      setFired((previous) => {
        const next = new Set(previous);
        next.add(index);
        return next;
      });

      onFire();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while challenging the argument."
      );
    } finally {
      setLoading(null);
    }
  }

  const all =
    objections.length > 0 && fired.size === objections.length;

  return (
    <div className="card">
      <div className="mono">Attack arena · challenge the argument</div>

      <p
        style={{
          color: "var(--mut)",
          margin: "6px 0 12px",
          fontSize: 14,
        }}
      >
        Select an objection and let Gemma try to break the current argument.
      </p>

      {objections.map((o, i) => {
        const isFired = fired.has(i);
        const isLoading = loading === i;

        return (
          <button
            key={i}
            className={`obj ${isFired ? "fired" : ""}`}
            disabled={loading !== null}
            onClick={() => challengeObjection(o, i)}
          >
            <span aria-hidden>
              {isLoading ? "⏳ " : isFired ? "✓ " : "⚡ "}
            </span>

            {isLoading ? "Gemma is attacking..." : o}
          </button>
        );
      })}

      {!objections.length && (
        <p
          style={{
            color: "var(--mut)",
            margin: "6px 0 0",
          }}
        >
          No objections recorded for this stage.
        </p>
      )}

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgba(255,80,80,.35)",
            borderRadius: 10,
            color: "#ffb4b4",
          }}
        >
          <strong>Challenge failed</strong>
          <div style={{ marginTop: 4 }}>{error}</div>
        </div>
      )}

      {challenge && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
          }}
        >
          <div className="mono">Gemma's attack</div>

          <div style={{ marginTop: 12 }}>
            <strong>
              Objection strength: {challenge.objectionStrength}/4
            </strong>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Vulnerability</strong>
            <p style={{ marginTop: 5 }}>
              {challenge.vulnerability}
            </p>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Response</strong>
            <p style={{ marginTop: 5 }}>
              {challenge.response}
            </p>
          </div>

          <div style={{ marginTop: 14 }}>
            <strong>Repaired argument</strong>
            <p style={{ marginTop: 5 }}>
              {challenge.repairedArgument}
            </p>
          </div>

          {challenge.requiresExternalEvidence && (
            <div
              style={{
                marginTop: 14,
                padding: 10,
                borderRadius: 8,
                background: "rgba(255,180,60,.08)",
              }}
            >
              <strong>⚠ Evidence required</strong>

              <ul style={{ marginTop: 6 }}>
                {challenge.evidenceRequirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div className="mono">Evaluation</div>

            <p>
              <strong>Logical rigor:</strong>{" "}
              {challenge.evaluation.logicalRigor.score}/4
              <br />
              {challenge.evaluation.logicalRigor.reason}
            </p>

            <p>
              <strong>Relevance:</strong>{" "}
              {challenge.evaluation.relevance.score}/4
              <br />
              {challenge.evaluation.relevance.reason}
            </p>

            <p>
              <strong>Resistance:</strong>{" "}
              {challenge.evaluation.resistanceToRebuttal.score}/4
              <br />
              {challenge.evaluation.resistanceToRebuttal.reason}
            </p>
          </div>
        </div>
      )}

      {all && nextLabel && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 15, margin: "0 0 6px" }}>
            All objections have been challenged by Gemma.
          </p>

          <button className="btn" onClick={onNext}>
            {nextLabel} →
          </button>
        </div>
      )}
    </div>
  );
}