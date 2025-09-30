// Gemini image generation using @google/genai SDK
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (!GEMINI_API_KEY) {
      return res.status(200).json({ url: null, error: 'image_generation_unavailable' });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
      });

      const config = {
        responseModalities: ['IMAGE'],
      };

      const model = 'gemini-2.5-flash-image-preview';

      const contents = [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

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
        return res.status(200).json({ url: dataUrl, error: null });
      } else {
        return res.status(200).json({ url: null, error: 'image_generation_unavailable' });
      }

    } catch (err) {
      console.error('[api] image generation error:', err.message || err);
      return res.status(200).json({ url: null, error: 'image_generation_unavailable' });
    }
  } catch (e) {
    console.error('[api] handler error:', e);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}
