export function computeScores(resp: Record<string, number>) {
  const v = (id: string) => Number.isFinite(resp[id]) ? resp[id] : 4;
  const r = (id: string) => 8 - v(id); // reverse

  // Facets
  const ExtraversionAssertiveness = avg([v('Q01'), v('Q13'), v('Q21')]);
  const ExtraversionSociability = avg([r('Q07'), r('Q22'), r('Q34')]);
  const ConscientiousnessOrderliness = avg([v('Q06'), v('Q12'), v('Q23')]);
  const ConscientiousnessIndustriousness = avg([v('Q02'), v('Q17'), v('Q24'), v('Q31')]);
  const EmotionalStabilityCalmness = avg([r('Q03'), v('Q08'), v('Q26')]);
  const EmotionalStabilityResilience = avg([v('Q14'), r('Q25')]);
  const OpennessIntellect = avg([v('Q04'), v('Q15'), v('Q28')]);
  const OpennessAesthetic = avg([v('Q27'), r('Q09')]);
  const AgreeablenessCompassion = avg([v('Q05'), v('Q19'), v('Q29')]);
  const AgreeablenessCandor = avg([v('Q10'), r('Q16'), v('Q30')]);

  // Major Traits (from facets)
  const Extraversion = avg([ExtraversionAssertiveness, ExtraversionSociability]);
  const Conscientiousness = avg([ConscientiousnessOrderliness, ConscientiousnessIndustriousness]);
  const EmotionalStability = avg([EmotionalStabilityCalmness, EmotionalStabilityResilience]);
  const Openness = avg([OpennessIntellect, OpennessAesthetic]);
  const Agreeableness = avg([AgreeablenessCompassion, AgreeablenessCandor]);
  const Decisiveness = avg([v('Q11'), v('Q21'), v('Q30')]);
  const RiskOrientation = avg([v('Q18'), v('Q28')]);
  const SelfInsight = avg([v('Q20'), v('Q31'), v('Q32')]);

  // Report-only sliders
  const FocusStyle = avg([v('Q31'), v('Q32')]);
  const FeedbackPreference = avg([v('Q30'), v('Q33')]);
  const SocialRecharge = avg([v('Q22'), v('Q34')]);

  return {
    // Major traits
    Extraversion,
    Conscientiousness,
    EmotionalStability,
    Openness,
    Agreeableness,
    Decisiveness,
    RiskOrientation,
    SelfInsight,
    // Facets
    facets: {
      'Extraversion: Assertiveness': ExtraversionAssertiveness,
      'Extraversion: Sociability': ExtraversionSociability,
      'Conscientiousness: Orderliness': ConscientiousnessOrderliness,
      'Conscientiousness: Industriousness': ConscientiousnessIndustriousness,
      'Emotional Stability: Calmness': EmotionalStabilityCalmness,
      'Emotional Stability: Resilience': EmotionalStabilityResilience,
      'Openness: Intellect': OpennessIntellect,
      'Openness: Aesthetic': OpennessAesthetic,
      'Agreeableness: Compassion': AgreeablenessCompassion,
      'Agreeableness: Candor': AgreeablenessCandor
    },
    // Report-only
    reportOnly: {
      FocusStyle,
      FeedbackPreference,
      SocialRecharge
    }
  };
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

export function topThreeMajor(s: ReturnType<typeof computeScores>) {
  const all8 = [
    ['Extraversion', s.Extraversion],
    ['Conscientiousness', s.Conscientiousness],
    ['Emotional Stability', s.EmotionalStability],
    ['Openness', s.Openness],
    ['Agreeableness', s.Agreeableness],
    ['Decisiveness', s.Decisiveness],
    ['Risk Orientation', s.RiskOrientation],
    ['Self Insight', s.SelfInsight]
  ] as const;
  return [...all8].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
}

function avg(nums: number[]) { return Number((nums.reduce((a,b)=>a+b,0) / nums.length).toFixed(2)); }