export interface Question {
  id: string;
  text: string;
  reverse?: boolean;
}

export const QUESTIONS: Question[] = [
  {"id":"Q01","text":"I feel energized after meeting new people."},
  {"id":"Q02","text":"I keep my promises even when no one is checking."},
  {"id":"Q03","text":"I get stressed easily by small things.","reverse":true},
  {"id":"Q04","text":"I enjoy exploring new ideas, art, or viewpoints."},
  {"id":"Q05","text":"I often put others' needs ahead of my own."},
  {"id":"Q06","text":"I plan tasks and stick to deadlines."},
  {"id":"Q07","text":"I prefer a quiet night to a lively social event.","reverse":true},
  {"id":"Q08","text":"I stay calm and collected under pressure."},
  {"id":"Q09","text":"I like routines more than surprises.","reverse":true},
  {"id":"Q10","text":"I find it easy to see things from others' perspectives."},
  {"id":"Q11","text":"I act quickly even with limited information."},
  {"id":"Q12","text":"I double-check details to avoid mistakes."},
  {"id":"Q13","text":"I feel comfortable leading group efforts."},
  {"id":"Q14","text":"I bounce back quickly after setbacks."},
  {"id":"Q15","text":"I question traditional ways of doing things."},
  {"id":"Q16","text":"I avoid conflicts, even when I disagree.","reverse":true},
  {"id":"Q17","text":"I track habits or goals to measure progress."},
  {"id":"Q18","text":"I enjoy taking calculated risks."},
  {"id":"Q19","text":"I prefer collaborating to competing."},
  {"id":"Q20","text":"I reflect on my feelings to understand my reactions."},
  {"id":"Q21","text":"I speak up even if others hesitate."},
  {"id":"Q22","text":"I prefer a few deep friendships over many acquaintances.","reverse":true},
  {"id":"Q23","text":"I tidy up as I go so things don't pile up."},
  {"id":"Q24","text":"I finish what I start, even when it gets boring."},
  {"id":"Q25","text":"I worry about worst-case scenarios.","reverse":true},
  {"id":"Q26","text":"I let small annoyances pass without reacting."},
  {"id":"Q27","text":"I seek new art, books, or experiences every month."},
  {"id":"Q28","text":"I question rules if they block progress."},
  {"id":"Q29","text":"I comfort people in distress, even when it's inconvenient."},
  {"id":"Q30","text":"I address problems directly rather than hinting."},
  {"id":"Q31","text":"I prefer a clear plan with milestones over \"winging it\"."},
  {"id":"Q32","text":"I can focus deeply for long stretches without checking my phone."},
  {"id":"Q33","text":"I like feedback that is blunt and actionable."},
  {"id":"Q34","text":"I recharge alone after social or work events.","reverse":true}
];

export const systemMessage = `You are a supportive, insightful personality coach.
Write a warm, engaging, non-clinical narrative in clear English.
Use markdown with bold section titles, short paragraphs (4–6 sentences each), and tasteful emojis for scannability.
Avoid raw question text or item codes. Focus on lived behaviors, patterns, and practical tips grounded in everyday life.
Target length: 600–800 words.
End with a short section titled exactly: Portrait Reflection:`;

export const developerMessage = `SCORING
- Likert 1..7; reverse: Q03, Q07, Q09, Q16, Q22, Q25, Q34 → 8 − response.

FACETS (means 1..7):
Extraversion.Assertiveness: Q01,Q13,Q21
Extraversion.Sociability: Q07r,Q22r,Q34r
Conscientiousness.Orderliness: Q06,Q12,Q23
Conscientiousness.Industriousness: Q02,Q17,Q24,Q31
EmotionalStability.Calmness: Q03r,Q08,Q26
EmotionalStability.Resilience: Q14,Q25r
Openness.Intellect: Q04,Q15,Q28
Openness.Aesthetic: Q27,Q09r
Agreeableness.Compassion: Q05,Q19,Q29
Agreeableness.Candor: Q10,Q16r,Q30

MAJOR TRAITS (averages of their facets):
- Extraversion
- Conscientiousness
- Emotional Stability
- Openness
- Agreeableness
- Decisiveness (Q11,Q21,Q30)
- Risk Orientation (Q18,Q28)
- Self Insight (Q20,Q31,Q32)

REPORT-ONLY SLIDERS:
- Focus Style: Q31,Q32
- Feedback Preference: Q30,Q33
- Social Recharge: Q22,Q34

LABELING:
Identify the top three major traits. Coin a concise Type Label, e.g. "Resilient Pathfinder (Openness + Risk Orientation + Emotional Stability)."

OUTPUT (markdown allowed):
Title: **Your Personality Snapshot: {Type Label}**

**Core Traits (1–7) 🔎**: Each major trait with score and a friendly one-liner.
**Facet Highlights 🧭**: One line per facet showing nuance.
**Patterns & Contrasts 🔀**: 1–2 paragraphs weaving how traits interact or conflict in daily life.
**Working With Others 🤝**: 1 short paragraph + 3–5 bullets.
**When You're Most Fulfilled ✨**: 1 paragraph about contexts that raise happiness.
**Style & Preferences 🧰**: 1 paragraph about focus, feedback, and recharge style.
**Strengths ✅**: 1 short paragraph + 3–5 concise bullets.
**Potential Blind Spots ⚠️**: 1 short paragraph + 3–5 constructive bullets.

Tone: warm, specific, actionable, everyday English.`;

export function buildUserMessage(
  questions: Question[],
  responses: Record<string, number>
) {
  return `QUESTIONNAIRE:
${JSON.stringify(questions, null, 2)}

RESPONSES:
${JSON.stringify(responses, null, 2)}

TASK:
- Apply reversals for Q03, Q07, Q09, Q16, Q22, Q25, Q34 using 8 - response.
- Compute facet scores, major trait scores, and report-only sliders as specified.
- Identify the top three major traits and generate a concise Type Label.
- Produce the full report per OUTPUT (markdown, bigger paragraphs, emojis).`;
}

export function buildTextMessages(questions: Question[], responses: Record<string, number>) {
  const userMessage = buildUserMessage(questions, responses);
  return { systemMessage, developerMessage, userMessage };
}