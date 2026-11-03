export const SYNTHETIC_SCORES = [
  { scorePercent: 95, label: 1 }, { scorePercent: 90, label: 0 },
  { scorePercent: 80, label: 1 }, { scorePercent: 70, label: 0 },
  { scorePercent: 60, label: 1 }, { scorePercent: 40, label: 0 },
  { scorePercent: 30, label: 1 }, { scorePercent: 10, label: 0 },
] as const;
export function calculateThreshold(thresholdPercent: number, fpCost: number, fnCost: number) {
  if (!Number.isInteger(thresholdPercent) || thresholdPercent < 0 || thresholdPercent > 100) throw new RangeError("threshold must be an integer percent");
  if (![fpCost, fnCost].every(value => Number.isFinite(value) && value >= 0 && value <= 10)) throw new RangeError("cost out of range");
  const counts = { TP: 0, FP: 0, FN: 0, TN: 0 };
  const rows = SYNTHETIC_SCORES.map(row => {
    const predicted = row.scorePercent >= thresholdPercent;
    const outcome = row.label === 1 ? (predicted ? "TP" : "FN") : (predicted ? "FP" : "TN");
    counts[outcome]++;
    return { ...row, predicted, outcome };
  });
  const ratio = (numerator: number, denominator: number) => denominator === 0 ? null : numerator / denominator;
  return { rows, ...counts, precision: ratio(counts.TP, counts.TP + counts.FP), recall: ratio(counts.TP, counts.TP + counts.FN), f1: ratio(2 * counts.TP, 2 * counts.TP + counts.FP + counts.FN), totalCost: counts.FP * fpCost + counts.FN * fnCost };
}
