export type Tok = { w: string; add: boolean };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Word-level diff: returns the NEW text as tokens, flagging words not present in the previous text. */
export function wordDiff(prev: string, next: string): Tok[] {
  const a = prev.split(/\s+/).filter(Boolean);
  const b = next.split(/\s+/).filter(Boolean);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = norm(a[i]!) === norm(b[j]!) ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out: Tok[] = [];
  let i = 0, j = 0;
  while (j < m) {
    if (i < n && norm(a[i]!) === norm(b[j]!)) { out.push({ w: b[j]!, add: false }); i++; j++; }
    else if (i < n && dp[i + 1]![j]! >= dp[i]![j + 1]!) i++;
    else { out.push({ w: b[j]!, add: true }); j++; }
  }
  return out;
}
