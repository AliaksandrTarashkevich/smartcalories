export function buildTextMessages(questions: any, responses: any) {
  const systemMessage = `You are a supportive, insightful personality coach.
Write a warm, engaging, non-clinical narrative in plain text (no markdown bold, no **).
Use simple headings as plain lines and paragraphs (no markdown symbols).
Avoid raw question text or trait codes. Focus on lived behaviors and practical insights.
Length: 500–700 words.
End with a short section titled: Portrait Reflection:`;

  const developerMessage = `SCORING:
- Likert 1..7; reverse: Q03, Q07, Q09, Q16 -> 8 - response.
- Trait means:
  Extraversion: Q01,Q07r,Q13
  Conscientiousness: Q02,Q06,Q12,Q17
  Emotional Stability: Q03r,Q08,Q14
  Openness: Q04,Q09r,Q15
  Agreeableness: Q05,Q10,Q16r,Q19
  (Report-only: Decisiveness Q11, Risk Orientation Q18, Self Insight Q20)
- Identify the top two among the five major traits and coin a concise Type Label.

OUTPUT (plain text only, no **):
Title: Your Personality Snapshot: {Type Label}
Core Traits (1–7): each trait with a short friendly sentence after the score.
How You Tend to Show Up: 2–3 paragraphs with concrete, everyday patterns.
Strengths: 1 short paragraph + 3–5 concise bullets.
Potential Blind Spots: 1 short paragraph + 3–5 constructive bullets.
Working With Others: 1 short paragraph + 3–5 bullets on collaboration/communication.
When You’re Most Fulfilled: 1 short paragraph about contexts that raise happiness.
Portrait Reflection: 2–3 sentences explaining how the visual portrait (style, colors, symbols) echoes the top traits.

Never output markdown bold or **. Keep the tone kind, specific, actionable.`;

  const userMessage = `QUESTIONNAIRE:
${JSON.stringify(questions, null, 2)}

RESPONSES:
${JSON.stringify(responses, null, 2)}

TASK:
Compute scores and produce the full report per OUTPUT. Make sure the final section is titled exactly: Portrait Reflection:`;

  return { systemMessage, developerMessage, userMessage };
}
