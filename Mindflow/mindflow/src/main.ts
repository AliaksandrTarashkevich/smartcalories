import { computeScores, topTwoBigFive } from './lib/score';
import { buildTextMessages } from './lib/prompts';

const API_BASE = import.meta.env.VITE_API_BASE || "";

const QUESTIONS: { id: string; text: string }[] = [
  { id: 'Q01', text: 'I feel energized by meeting new people.' },
  { id: 'Q02', text: 'I keep my tasks and spaces organized.' },
  { id: 'Q03', text: 'I often worry about small things.' },
  { id: 'Q04', text: 'I enjoy exploring new ideas and experiences.' },
  { id: 'Q05', text: 'I try to be considerate of others’ feelings.' },
  { id: 'Q06', text: 'I follow through on my commitments reliably.' },
  { id: 'Q07', text: 'I prefer quiet time to socializing.' },
  { id: 'Q08', text: 'I bounce back quickly after setbacks.' },
  { id: 'Q09', text: 'I’m skeptical of unusual or novel approaches.' },
  { id: 'Q10', text: 'I try to be patient and cooperative.' },
  { id: 'Q11', text: 'I make decisions promptly when needed.' },
  { id: 'Q12', text: 'I plan ahead and manage my time well.' },
  { id: 'Q13', text: 'I enjoy group activities and lively settings.' },
  { id: 'Q14', text: 'I can stay calm under pressure.' },
  { id: 'Q15', text: 'I like learning across different fields or arts.' },
  { id: 'Q16', text: 'I can be blunt even if it seems harsh.' },
  { id: 'Q17', text: 'I like setting goals and seeing them through.' },
  { id: 'Q18', text: 'I’m comfortable taking calculated risks.' },
  { id: 'Q19', text: 'I try to see the good in people.' },
  { id: 'Q20', text: 'I can accurately reflect on my strengths and limits.' },
];

const STEPS = [
  'Analyzing your responses…',
  'Composing insights…',
  'Finalizing results…'
] as const;

type Responses = Record<string, number>;

function init() {
  const qs = document.getElementById('questions')!;
  const form = document.getElementById('questionnaire') as HTMLFormElement;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;

  QUESTIONS.forEach((q, idx) => {
    const section = document.createElement('section');
    section.className = 'question';

    const row = document.createElement('div');
    row.className = 'row';

    const title = document.createElement('h3');
    title.textContent = `${idx + 1}. ${q.text}`;

    const control = document.createElement('div');
    control.className = 'control';
    // default fill position (center)
    control.style.setProperty('--percent', '50%');

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '1';
    range.max = '7';
    range.step = '1';
    range.value = '4';
    range.setAttribute('list', 'ticks-7');
    range.name = q.id;
    range.id = q.id;

    // accessibility
    range.setAttribute('aria-label', `${q.text} slider`);
    range.setAttribute('aria-valuemin', '1');
    range.setAttribute('aria-valuemax', '7');
    range.setAttribute('aria-valuenow', '4');

    const updatePercent = () => {
      range.setAttribute('aria-valuenow', range.value);
      const min = Number(range.min) || 0;
      const max = Number(range.max) || 100;
      const val = Number(range.value) || 0;
      const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
      control.style.setProperty('--percent', pct + '%');
    };
    range.addEventListener('input', updatePercent);

    range.addEventListener('keydown', (e) => {
      // left/right arrows adjust by 1
      if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        const v = Math.max(1, Number(range.value) - 1);
        range.value = String(v);
        range.dispatchEvent(new Event('input'));
      }
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        const v = Math.min(7, Number(range.value) + 1);
        range.value = String(v);
        range.dispatchEvent(new Event('input'));
      }
    });

    // initialize fill
    updatePercent();

    const labels = document.createElement('div');
    labels.className = 'labels';
    const l = document.createElement('span'); l.textContent = 'Least likely';
    const r = document.createElement('span'); r.textContent = 'Most likely';
    labels.append(l, r);

    control.append(range, labels);
    row.append(title, control);
    section.append(row);
    qs.append(section);
  });

  // Hide results until analysis completes
  const results = document.getElementById('results')!;
  results.setAttribute('hidden', '');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    // gender removed from UI and prompt
    const responses: Responses = {};
    QUESTIONS.forEach(q => { responses[q.id] = Number((document.getElementById(q.id) as HTMLInputElement).value) || 4; });

    const scores = computeScores(responses);
    const topTraits = topTwoBigFive(scores);
    console.log('[client] submit: topTraits', topTraits);

    const progress = createProgress();
    progress.open();

    try {
      progress.toStep(0);
      progress.animateTo(30, 600);

      progress.toStep(1);
      const msgs = buildTextMessages(QUESTIONS, responses);
      const textReq = fetch(`${API_BASE}/api/analyze-personality`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgs)
      }).then(r => r.json());

      progress.animateTo(70, 800);

      // Resolve text first
      const textRes = await textReq;

      // Text is ready — finish the progress quickly
      progress.toStep(2);
      await progress.animateTo(100, 200);
      
      // Small delay to show 100% before closing
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Close progress modal
      progress.close();

      const fullText = stripBold((textRes?.text || '').trim());
      console.log('[client] text analysis ready, chars:', fullText.length);
      if (!fullText) {
        console.warn('No analysis text returned from API.');
      }
      renderReport(fullText);
      // Show results after text is ready (full width report first)
      results.removeAttribute('hidden');

      // Show fantasy set controls and wire generator
      const fantasy = document.getElementById('fantasy') as HTMLElement | null;
      const grid = document.getElementById('fantasyGrid') as HTMLDivElement | null;
      const setBtn = document.getElementById('genSetBtn') as HTMLButtonElement | null;
      if (fantasy && grid && setBtn) {
        fantasy.removeAttribute('hidden');
        const generateSet = async () => {
          setBtn.disabled = true;
          grid.innerHTML = '';
          const [t1, t2] = topTraits as string[];
          const primaryTrait = String(t1 || 'Openness');
          const secondaryTrait = String(t2 || 'Conscientiousness');

          const items = [
            { 
              key: 'Crown', 
              prompt: (v: any) => `A regal fantasy portrait of a noble figure wearing an ornate ${v.crown_type}, seated on a throne of crystal and gold. Ethereal blue and purple lighting illuminates intricate gemstone details. Cinematic composition with depth of field, photorealistic textures, 8K resolution, fantasy royal court setting, majestic atmosphere` 
            },
            { 
              key: 'Mythical Creature', 
              prompt: (v: any) => `A magnificent ${v.creature_type} soaring through a mystical sky filled with floating islands and cascading waterfalls. The creature's scales shimmer with ${v.color} energy, embodying the essence of ${v.personality_trait}. Epic fantasy landscape with dramatic clouds, golden hour lighting, highly detailed scales and wings, cinematic wide shot` 
            },
            { 
              key: 'Realm', 
              prompt: (v: any) => `A breathtaking panoramic view of the ${v.realm_type} realm - a vast landscape of floating mountains connected by bridges of light. Crystal formations emit ${v.color} energy, representing ${v.personality_trait}. Misty valleys below, aurora borealis above, fantasy architecture, atmospheric perspective, cinematic fantasy art` 
            },
            { 
              key: 'Weapon', 
              prompt: (v: any) => `An ancient ${v.weapon_type} floating in a mystical chamber, its blade glowing with ${v.color} energy and inscribed with glowing runes that pulse with power. The weapon embodies ${v.personality_trait}. Stone altar with mystical symbols, dramatic lighting from above, photorealistic metal textures, fantasy artifact concept art` 
            },
            { 
              key: 'Color Aura', 
              prompt: (v: any) => `A mystical figure in meditation pose, surrounded by swirling ${v.color} energy that forms intricate patterns in the air. The aura represents ${v.personality_trait} and creates beautiful light trails. Floating particles, soft ethereal glow, spiritual atmosphere, fantasy meditation scene, cinematic lighting` 
            },
            { 
              key: 'Rune', 
              prompt: (v: any) => `An ancient stone tablet carved with a glowing ${v.color} rune that pulses with mystical energy. The rune embodies ${v.personality_trait} and is surrounded by floating magical symbols. Cracked stone texture, dramatic shadows, otherworldly glow, fantasy archaeological artifact, detailed stonework` 
            },
            { 
              key: 'Mythological God/Goddess', 
              prompt: (v: any) => `A divine portrait of a ${v.god_or_goddess} standing in a celestial realm, embodying ${v.personality_trait}. Flowing robes of ${v.color} silk, ornate golden accessories, divine aura radiating light. Cosmic background with stars and nebula, epic mythological art style, photorealistic divine being, cinematic godly presence` 
            }
          ];
          console.log('[client] fantasy generation start, items:', items.length);

          const vars = {
            personality_trait: primaryTrait,
            crown_type: 'golden royal crown, glowing with divine light',
            creature_type: secondaryTrait === 'Emotional Stability' ? 'phoenix' : 'dragon',
            realm_type: primaryTrait.toLowerCase(),
            weapon_type: secondaryTrait === 'Conscientiousness' ? 'sword' : 'staff',
            color: primaryTrait === 'Openness' ? 'aurora violet-blue' : 'warm golden',
            god_or_goddess: primaryTrait === 'Agreeableness' ? 'goddess of harmony' : 'god of insight'
          };

          const makeCard = (title: string) => {
            const wrap = document.createElement('div'); wrap.className = 'art';
            const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = 'Generating image…';
            const content = document.createElement('div'); content.className = 'art-content';
            const h = document.createElement('h3'); h.textContent = title;
            const desc = document.createElement('p'); desc.className = 'art-description loading'; desc.textContent = '';
            content.append(h, desc);
            wrap.append(ph, content); 
            grid.appendChild(wrap);
            return { wrap, ph, desc, content };
          };

          const cards = items.map((i) => ({ i, c: makeCard(i.key) }));

          await Promise.all(cards.map(async ({ i, c }) => {
            try {
              const prompt = i.prompt(vars);
              const res = await fetch(`${API_BASE}/api/generate-image`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
              }).then(r => r.json());
              const url = res?.url || null;
              if (url) {
                const img = document.createElement('img'); img.src = url;
                c.wrap.replaceChild(img, c.ph);
                console.log('[client] fantasy OK:', i.key);

                // Generate description
                c.desc.textContent = 'Generating description…';
                try {
                  const descPrompt = `You are analyzing a fantasy image titled "${i.key}" that was created to represent the personality trait "${vars.personality_trait}". The image shows: ${prompt}. Write a concise 2-3 sentence description explaining what is depicted in the image and how it symbolically represents the ${vars.personality_trait} personality trait. Be specific and insightful.`;
                  
                  const descRes = await fetch(`${API_BASE}/api/analyze-personality`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      systemMessage: 'You are a creative interpreter of symbolic imagery.',
                      developerMessage: 'Write exactly 2-3 sentences. No markdown, no bold. Plain text only.',
                      userMessage: descPrompt
                    })
                  }).then(r => r.json());

                  const description = (descRes?.text || 'A mystical representation of your personality.').trim();
                  c.desc.textContent = description;
                  c.desc.classList.remove('loading');
                  console.log('[client] description OK:', i.key);
                } catch (descErr) {
                  c.desc.textContent = 'A symbolic representation crafted from your unique personality traits.';
                  c.desc.classList.remove('loading');
                  console.error('[client] description error:', i.key, descErr);
                }
              } else {
                c.ph.textContent = 'Image unavailable';
                c.desc.textContent = '';
                console.warn('[client] fantasy unavailable:', i.key);
              }
            } catch (e) {
              c.ph.textContent = 'Generation error';
              c.desc.textContent = '';
              console.error('[client] fantasy error:', i.key, e);
            }
          }));

          setBtn.disabled = false;
        };
        setBtn.onclick = generateSet;
      }
    } catch (err) {
      console.error(err);
      await progress.animateTo(100, 300);
      progress.close();
      alert('Something went wrong. Please try again later.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function createProgress() {
  const modal = document.getElementById('progressModal')!;
  const bar = document.getElementById('progressBar') as HTMLDivElement;
  const percent = document.getElementById('progressPercent') as HTMLSpanElement;
  const step = document.getElementById('progressStep') as HTMLParagraphElement;

  let current = 0;
  let raf: number | null = null;

  const open = () => { 
    modal.removeAttribute('hidden'); 
    document.body.classList.add('generating');
  };
  const close = () => { 
    modal.setAttribute('hidden', ''); 
    document.body.classList.remove('generating');
  };
  const toStep = (i: number) => { step.textContent = STEPS[i] || STEPS[STEPS.length - 1]; };

  const animateTo = (target: number, duration = 1000) => new Promise<void>((resolve) => {
    const start = performance.now();
    const begin = current;
    const end = Math.max(current, Math.min(target, 100));
    if (end === begin) return resolve();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      current = Math.round(begin + (end - begin) * eased);
      bar.style.width = `${current}%`;
      bar.setAttribute('aria-valuenow', String(current));
      percent.textContent = String(current);
      if (current >= end) return resolve();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });

  return { open, close, animateTo, toStep };
}

function stripBold(text: string) {
  return text.replace(/\*\*/g, '');
}

function renderReport(text: string) {
  const container = document.getElementById('reportText') as HTMLDivElement;
  container.innerHTML = '';
  const parts = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    const el = document.createElement('p');
    el.textContent = p;
    container.appendChild(el);
  }
}


init();
