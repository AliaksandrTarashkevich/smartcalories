// Gemini text generation via REST
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function geminiGenerate(body, retries = 2) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  for (let i = 0; i <= retries; i++) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) return await r.json();
    if ((r.status === 429 || r.status === 503) && i < retries) {
      await new Promise(res => setTimeout(res, 400 * Math.pow(2, i)));
      continue;
    }
    const txt = await r.text().catch(() => '');
    throw new Error(`Gemini error ${r.status}: ${txt}`);
  }
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { systemMessage, developerMessage, userMessage } = req.body || {};
    if (!systemMessage || !developerMessage || !userMessage) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (!GEMINI_API_KEY) return res.status(200).json({ text: '' });

    const payload = {
      contents: [
        { role: 'user', parts: [{ text: [systemMessage, developerMessage, userMessage].filter(Boolean).join('\n\n') }] }
      ]
    };
    const data = await geminiGenerate(payload).catch((e) => { console.error(e); return null; });
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts.map(p => p?.text || '').join('');
    const text = (raw || '').replace(/\*\*/g, '');
    return res.json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to analyze personality' });
  }
};
