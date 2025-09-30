export function computeScores(resp: Record<string, number>) {
  const v = (id: string) => Number.isFinite(resp[id]) ? resp[id] : 4;
  const r = (id: string) => 8 - v(id); // reverse

  const Extraversion = avg([v('Q01'), r('Q07'), v('Q13')]);
  const Conscientiousness = avg([v('Q02'), v('Q06'), v('Q12'), v('Q17')]);
  const EmotionalStability = avg([r('Q03'), v('Q08'), v('Q14')]);
  const Openness = avg([v('Q04'), r('Q09'), v('Q15')]);
  const Agreeableness = avg([v('Q05'), v('Q10'), r('Q16'), v('Q19')]);
  const Decisiveness = v('Q11');
  const RiskOrientation = v('Q18');
  const SelfInsight = v('Q20');

  return { Extraversion, Conscientiousness, EmotionalStability, Openness, Agreeableness, Decisiveness, RiskOrientation, SelfInsight };
}

export function topTwoBigFive(s: ReturnType<typeof computeScores>) {
  const big5 = [
    ['Extraversion', s.Extraversion],
    ['Conscientiousness', s.Conscientiousness],
    ['Emotional Stability', s.EmotionalStability],
    ['Openness', s.Openness],
    ['Agreeableness', s.Agreeableness]
  ] as const;
  return [...big5].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
}

function avg(nums: number[]) { return Number((nums.reduce((a,b)=>a+b,0) / nums.length).toFixed(2)); }
