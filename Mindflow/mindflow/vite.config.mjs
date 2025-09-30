import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    const txt = fs.readFileSync(envPath, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    console.log('[dev env] Loaded .env for dev middleware');
  } catch (e) {
    console.error('[dev env] .env load error:', e?.message || e);
  }
}

loadDotEnv();

export default {
  plugins: [
    {
      name: 'api-middleware',
      configureServer(server) {
        const json = (res, code, obj) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        const parseBody = (req) => new Promise((resolve) => {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
          });
        });

        const backoff = (ms) => new Promise(r => setTimeout(r, ms));
        async function geminiGenerate(apiKey, model, body, retries = 2) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          for (let i = 0; i <= retries; i++) {
            const r = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (r.ok) return await r.json();
            if (r.status === 429 || r.status === 503) {
              if (i < retries) { await backoff(400 * Math.pow(2, i)); continue; }
            }
            const bodyText = await r.text().catch(() => '<non-text body>');
            throw new Error(`gemini non-OK ${r.status}: ${bodyText}`);
          }
        }

        server.middlewares.use('/api/analyze-personality', async (req, res, next) => {
          if (req.method === 'OPTIONS') return json(res, 200, {});
          if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
          try {
            req.body = await parseBody(req);
            const apiKey = process.env.GEMINI_API_KEY;
            const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
            if (apiKey) {
              try {
                const { systemMessage, developerMessage, userMessage } = req.body || {};
                const promptText = [systemMessage, developerMessage, userMessage].filter(Boolean).join('\n\n');
                const payload = { contents: [{ role: 'user', parts: [{ text: promptText }] }] };
                const data = await geminiGenerate(apiKey, model, payload).catch((e) => {
                  console.error('[dev api] analyze (gemini) error:', e?.message || e);
                  return null;
                });
                const parts = data?.candidates?.[0]?.content?.parts || [];
                const raw = parts.map(p => p?.text || '').join('');
                if (!raw) {
                  console.error('[dev api] analyze empty choices/content');
                  throw new Error('empty analyze content');
                }
                const text = String(raw).replace(/\*\*/g, '');
                console.log('[dev api] analyze OK, chars:', text.length, 'payloadLen:', (developerMessage?.length||0)+(userMessage?.length||0));
                return json(res, 200, { text });
              } catch (e) {
                console.error('[dev api] analyze (gemini) error:', e?.stack || e?.message || e);
              }
            }
            // Fallback sample text
            const fallbackText = [
              'Title: Your Personality Snapshot: Explorer Organizer',
              '',
              'Core Traits (1–7):',
              'Extraversion: 4 — You balance social time with reflection.',
              'Conscientiousness: 5 — You like structure when it matters.',
              'Emotional Stability: 5 — You regain calm after stress.',
              'Openness: 6 — You enjoy ideas and experimentation.',
              'Agreeableness: 5 — You aim for harmony where possible.',
              '',
              'How You Tend to Show Up:',
              'You show steady energy and a curious mindset in everyday contexts. You weigh options, aim for clarity, and prefer momentum over perfection.',
              '',
              'Strengths:',
              '- You connect dots quickly and find practical next steps.',
              '- Your reliability helps teams trust commitments.',
              '- You listen first, then contribute clearly.',
              '',
              'Potential Blind Spots:',
              '- Overweighing options can slow a decision.',
              '- Too much structure can limit creativity windows.',
              '',
              'Working With Others:',
              '- You value clarity, timelines, and open communication.',
              '',
              'When You’re Most Fulfilled:',
              'When work blends tangible progress with learning and autonomy.',
              '',
              'Portrait Reflection:',
              'A bright, warm scene with gentle gradients and steady horizon lines, symbolizing openness and conscientious follow-through.'
            ].join('\n');
            return json(res, 200, { text: fallbackText });
          } catch (err) {
            console.error(err);
            return json(res, 500, { error: 'Failed to analyze personality' });
          }
        });

        // Image generation using @google/genai SDK
        server.middlewares.use('/api/generate-image', async (req, res, next) => {
          if (req.method === 'OPTIONS') return json(res, 200, {});
          if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
          try {
            req.body = await parseBody(req);
            const { prompt } = req.body || {};
            if (!prompt) return json(res, 400, { error: 'Prompt is required' });

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              return json(res, 200, { url: null, error: 'image_generation_unavailable' });
            }

            try {
              // Use dynamic import for @google/genai
              const { GoogleGenAI } = await import('@google/genai');
              
              const ai = new GoogleGenAI({ apiKey });
              const config = { responseModalities: ['IMAGE'] };
              const model = 'gemini-2.5-flash-image-preview';
              const contents = [{ role: 'user', parts: [{ text: prompt }] }];

              console.log('[dev api] image gen request, prompt length:', prompt.length);
              
              const response = await ai.models.generateContentStream({ model, config, contents });

              let imageData = null;
              let mimeType = 'image/png';

              for await (const chunk of response) {
                if (!chunk.candidates?.[0]?.content?.parts) continue;
                const inlineData = chunk.candidates[0].content.parts[0]?.inlineData;
                if (inlineData) {
                  imageData = inlineData.data;
                  mimeType = inlineData.mimeType || 'image/png';
                  break;
                }
              }

              if (imageData) {
                const dataUrl = `data:${mimeType};base64,${imageData}`;
                console.log('[dev api] image gen OK, size:', imageData.length);
                return json(res, 200, { url: dataUrl, error: null });
              } else {
                console.warn('[dev api] image gen: no image data in response');
                return json(res, 200, { url: null, error: 'image_generation_unavailable' });
              }
            } catch (err) {
              console.error('[dev api] image gen error:', err.message || err);
              return json(res, 200, { url: null, error: 'image_generation_unavailable' });
            }
          } catch (err) {
            console.error('[dev api] image handler error:', err);
            return json(res, 500, { error: 'Failed to generate image' });
          }
        });
      }
    }
  ]
};
