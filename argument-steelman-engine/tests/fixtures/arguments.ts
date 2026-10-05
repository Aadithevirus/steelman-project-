// Small regression set: run each claim through /api/steelman and review the checks below by hand or script.
export const fixtures = [
  { claim: "Water boils at 100°C at sea level.", kind: "factual, strong", expectClaimType: "factual", expectFallacies: 0 },
  { claim: "Free will is an illusion.", kind: "philosophical", expectClaimType: "philosophical" },
  { claim: "Everyone I know got fired after AI arrived, so AI will end all jobs.", kind: "hasty generalization", expectFallacyNames: ["Hasty Generalization"] },
  { claim: "Either we ban social media or society collapses.", kind: "false dilemma", expectFallacyNames: ["False Dilemma"] },
  { claim: "It's better.", kind: "ambiguous", expectClaimType: "ambiguous" },
  { claim: "Remote work makes employees less productive.", kind: "causal, needs evidence", expectRequiresEvidence: true },
];
// Checks: stage 2 weaknesses reference stage 1; stage 3 reference stage 2; total === sum of parts;
// no invented citations/statistics; no fallacy labels on merely weak (not fallacious) arguments.
