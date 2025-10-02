import { computeScores, topTwoBigFive } from './lib/score';
import { buildTextMessages, QUESTIONS } from './lib/prompts';

const API_BASE = import.meta.env.VITE_API_BASE || "";

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
      // Render charts first
      renderTraitsChart(scores);
      renderFacetsChart(scores);
      
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
          
          // Unlock the Strengths and Blind Spots sections
          const lockedSections = document.querySelectorAll('.locked-section');
          lockedSections.forEach(section => {
            section.classList.remove('locked-section');
            const blurOverlay = section.querySelector('.blur-overlay');
            const unlockPrompt = section.querySelector('.unlock-prompt');
            if (blurOverlay) blurOverlay.classList.remove('blur-overlay');
            if (unlockPrompt) unlockPrompt.remove();
          });
          
          grid.innerHTML = '';
          const [t1, t2] = topTraits as string[];
          const primaryTrait = String(t1 || 'Openness');
          const secondaryTrait = String(t2 || 'Conscientiousness');

          const items = [
            { 
              key: 'Crown', 
              prompt: (v: any) => `A detailed fantasy crown made of ${v.crown_type}, decorated with ${v.gemstones}, glowing with a subtle aura of ${v.color}, photographed like a high-end jewelry catalog, macro detail, glossy textures, crisp studio background.` 
            },
            { 
              key: 'Mythical Creature', 
              prompt: (v: any) => {
                const styles: Record<string, string> = {
                  'dragon': 'oil painting, stormy sky, epic and imposing',
                  'phoenix': 'watercolor brushstrokes, blazing warm tones',
                  'unicorn': 'pastel illustration, soft gradients, dreamlike',
                  'wolf spirit': 'monochrome ink drawing with glowing highlights'
                };
                return `A ${v.creature_type} representing ${v.trait}, styled as ${styles[v.creature_type] || styles.dragon}.`;
              }
            },
            { 
              key: 'Realm', 
              prompt: (v: any) => `A wide landscape of the ${v.realm_type} realm, in ${v.realm_style}, infused with symbols of ${v.trait}.` 
            },
            { 
              key: 'Weapon', 
              prompt: (v: any) => `A legendary ${v.weapon_type}, presented as a 3D museum exhibit render, realistic metal and stone textures, glowing engraved runes, spotlight illumination, shallow depth of field.` 
            },
            { 
              key: 'Color Aura', 
              prompt: (v: any) => `A human silhouette glowing with an aura of ${v.color}, styled as ${v.aura_style}, symbolizing ${v.trait}.` 
            },
            { 
              key: 'Rune', 
              prompt: (v: any) => `An ancient ${v.rune}, carved into ${v.rune_material}, styled as ${v.rune_style}.` 
            },
            { 
              key: 'Mythological God/Goddess', 
              prompt: (v: any) => `A depiction of ${v.deity}, styled as ${v.deity_style}.` 
            },
            { 
              key: 'Tarot Card', 
              prompt: (v: any) => `A tarot card illustration of ${v.tarot_symbol}, in classic Rider-Waite style: bold line art, flat colors, symbolic background, mystical borders.` 
            }
          ];
          console.log('[client] fantasy generation start, items:', items.length);

          // Map traits to visual variables
          const traitMap: Record<string, any> = {
            'Openness': { crown: 'ivy', gemstone: 'amethyst', color: 'purple', creature: 'unicorn', realm: 'sky', weapon: 'staff', trait: 'creativity', deity: 'Athena', rune: 'Ansuz', tarot: 'The Unicorn' },
            'Conscientiousness': { crown: 'gold', gemstone: 'ruby', color: 'red', creature: 'dragon', realm: 'desert', weapon: 'sword', trait: 'ambition', deity: 'Odin', rune: 'Uruz', tarot: 'The Crown' },
            'Extraversion': { crown: 'gold', gemstone: 'sapphire', color: 'gold', creature: 'phoenix', realm: 'sky', weapon: 'spear', trait: 'energy', deity: 'Zeus', rune: 'Sowilo', tarot: 'The Phoenix' },
            'Emotional Stability': { crown: 'thorns', gemstone: 'emerald', color: 'blue', creature: 'phoenix', realm: 'ocean', weapon: 'staff', trait: 'peace', deity: 'Shiva', rune: 'Isa', tarot: 'The Ocean' },
            'Agreeableness': { crown: 'ivy', gemstone: 'emerald', color: 'green', creature: 'unicorn', realm: 'forest', weapon: 'bow', trait: 'compassion', deity: 'Lakshmi', rune: 'Gebo', tarot: 'The Forest' },
            'Decisiveness': { crown: 'antlers', gemstone: 'ruby', color: 'red', creature: 'wolf spirit', realm: 'underworld', weapon: 'sword', trait: 'courage', deity: 'Ra', rune: 'Thurisaz', tarot: 'The Sword' },
            'Risk Orientation': { crown: 'thorns', gemstone: 'sapphire', color: 'blue', creature: 'dragon', realm: 'sky', weapon: 'spear', trait: 'freedom', deity: 'Freyja', rune: 'Raido', tarot: 'The Dragon' },
            'Self Insight': { crown: 'ivy', gemstone: 'amethyst', color: 'purple', creature: 'wolf spirit', realm: 'underworld', weapon: 'staff', trait: 'wisdom', deity: 'Isis', rune: 'Kenaz', tarot: 'The Wolf Spirit' }
          };

          const primary = traitMap[primaryTrait] || traitMap['Openness'];
          const secondary = traitMap[secondaryTrait] || traitMap['Conscientiousness'];

          const vars = {
            crown_type: primary.crown,
            gemstones: primary.gemstone,
            color: primary.color,
            creature_type: primary.creature,
            trait: primary.trait,
            realm_type: primary.realm,
            realm_style: primaryTrait === 'Openness' ? 'surreal digital painting' : primaryTrait === 'Emotional Stability' ? 'deep blue matte painting' : 'hand-drawn storybook illustration',
            weapon_type: secondary.weapon,
            aura_style: primary.color === 'purple' ? 'fractal light spirals' : primary.color === 'blue' ? 'galaxy starfield glow' : primary.color === 'gold' ? 'radiant divine light' : 'watercolor wash',
            rune: primary.rune,
            rune_material: 'stone',
            rune_style: 'Norse rock engraving',
            deity: primary.deity,
            deity_style: primaryTrait === 'Openness' ? 'graphic novel ink illustration' : primaryTrait === 'Conscientiousness' ? 'golden relief carving' : 'Renaissance fresco',
            tarot_symbol: primary.tarot
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
                  const descPrompt = `You are analyzing a fantasy image titled "${i.key}" that was created to represent ${primaryTrait}. The image shows: ${prompt}. Write a concise 2-3 sentence description explaining what is depicted in the image and how it symbolically represents the ${primaryTrait} personality trait. Be specific and insightful.`;
                  
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
  // Keep markdown formatting for better readability
  return text;
}

function renderReport(text: string, locked = true) {
  const container = document.getElementById('reportText') as HTMLDivElement;
  container.innerHTML = '';
  
  // Split by section headers (looking for **Header**: or **Header** patterns at start of line)
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  
  lines.forEach((line) => {
    const headerMatch = line.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (headerMatch) {
      // This is a header
      if (currentContent.length > 0) {
        appendSection(container, currentSection, currentContent.join('\n').trim(), locked);
        currentContent = [];
      }
      currentSection = headerMatch[1].trim();
    } else {
      currentContent.push(line);
    }
  });
  
  // Append last section
  if (currentContent.length > 0) {
    appendSection(container, currentSection, currentContent.join('\n').trim(), locked);
  }
}

function appendSection(container: HTMLElement, header: string, content: string, locked: boolean) {
  const isLockedSection = locked && (header.includes('Strengths') || header.includes('Blind Spots'));
  
  console.log('[appendSection]', { header, isLockedSection, locked });
  
  const sectionDiv = document.createElement('div');
  if (isLockedSection) {
    sectionDiv.className = 'locked-section';
  }
  
  // Add header
  const headerEl = document.createElement('h3');
  headerEl.innerHTML = `<strong>${header}</strong>`;
  sectionDiv.appendChild(headerEl);
  
  // Process content
  const contentDiv = document.createElement('div');
  if (isLockedSection) {
    contentDiv.className = 'blur-overlay';
  }
  
  let html = content
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert bullet points to HTML lists
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Convert line breaks to paragraphs
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('');
  
  contentDiv.innerHTML = html;
  sectionDiv.appendChild(contentDiv);
  
  // Add unlock prompt for locked sections
  if (isLockedSection) {
    const prompt = document.createElement('div');
    prompt.className = 'unlock-prompt';
    prompt.textContent = 'Generate your Fantasy Set to unlock';
    sectionDiv.appendChild(prompt);
  }
  
  container.appendChild(sectionDiv);
}

function renderTraitsChart(scores: ReturnType<typeof computeScores>) {
  const canvas = document.getElementById('traitsChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const traits = [
    { name: 'Extraversion', value: scores.Extraversion, color: '#ff6b6b' },
    { name: 'Conscientiousness', value: scores.Conscientiousness, color: '#4ecdc4' },
    { name: 'Emotional Stability', value: scores.EmotionalStability, color: '#45b7d1' },
    { name: 'Openness', value: scores.Openness, color: '#a78bfa' },
    { name: 'Agreeableness', value: scores.Agreeableness, color: '#f9a826' },
    { name: 'Decisiveness', value: scores.Decisiveness, color: '#fd79a8' },
    { name: 'Risk Orientation', value: scores.RiskOrientation, color: '#fdcb6e' },
    { name: 'Self Insight', value: scores.SelfInsight, color: '#6c5ce7' }
  ];

  const width = canvas.width;
  const height = canvas.height;
  const barHeight = 30;
  const gap = 8;
  const leftMargin = 150;
  const maxValue = 7;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '14px system-ui, -apple-system, sans-serif';

  traits.forEach((trait, i) => {
    const y = i * (barHeight + gap) + 10;
    const barWidth = ((width - leftMargin - 40) * trait.value) / maxValue;

    // Draw label
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.fillText(trait.name, leftMargin - 10, y + barHeight / 2 + 5);

    // Draw bar background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(leftMargin, y, width - leftMargin - 40, barHeight);

    // Draw bar
    ctx.fillStyle = trait.color;
    ctx.fillRect(leftMargin, y, barWidth, barHeight);

    // Draw value
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(trait.value.toFixed(1), leftMargin + barWidth + 8, y + barHeight / 2 + 5);
  });
}

function renderFacetsChart(scores: ReturnType<typeof computeScores>) {
  const canvas = document.getElementById('facetsChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const facets = Object.entries(scores.facets).map(([name, value]) => ({ name, value }));
  
  const colors: Record<string, string> = {
    'Extraversion': '#ff6b6b',
    'Conscientiousness': '#4ecdc4',
    'Emotional Stability': '#45b7d1',
    'Openness': '#a78bfa',
    'Agreeableness': '#f9a826'
  };

  const width = canvas.width;
  const height = canvas.height;
  const barHeight = 28;
  const gap = 6;
  const leftMargin = 240;
  const maxValue = 7;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '13px system-ui, -apple-system, sans-serif';

  facets.forEach((facet, i) => {
    const y = i * (barHeight + gap) + 10;
    const barWidth = ((width - leftMargin - 40) * facet.value) / maxValue;
    
    // Get color based on parent trait
    const parentTrait = facet.name.split(':')[0];
    const color = colors[parentTrait] || '#6c5ce7';

    // Draw label
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.fillText(facet.name, leftMargin - 10, y + barHeight / 2 + 4);

    // Draw bar background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(leftMargin, y, width - leftMargin - 40, barHeight);

    // Draw bar
    ctx.fillStyle = color;
    ctx.fillRect(leftMargin, y, barWidth, barHeight);

    // Draw value
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(facet.value.toFixed(1), leftMargin + barWidth + 8, y + barHeight / 2 + 4);
  });
}


init();
