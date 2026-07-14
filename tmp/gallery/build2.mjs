import { readFileSync, writeFileSync } from 'fs';

const pairs = JSON.parse(readFileSync('pairs.json', 'utf8'));

const rows = pairs.map((p) => `
        <div class="pair">
          <div class="slot old">
            <div class="thumb"><img src="${p.v1}" alt="${p.word} — flat" loading="lazy" /></div>
            <span class="tag">Флэт</span>
          </div>
          <div class="slot new">
            <div class="thumb"><img src="${p.v2}" alt="${p.word} — 3D clay" loading="lazy" /></div>
            <span class="tag tag-new">3D Clay</span>
          </div>
          <div class="label">
            <span class="word">${p.word}</span>
            <span class="tj">${p.tj}</span>
          </div>
        </div>`).join('\n');

const html = `<section class="wrap">
  <header class="head">
    <p class="eyebrow">RAMZ Academy — муқоисаи услуб</p>
    <h1>Флэт-cartoon ва 3D Clay премиум</h1>
    <p class="sub">Ҳамон 4 калима, ду услуби гуногун: услуби аввали содда (флэт) дар муқобили услуби нави 3D clay бо рӯшноии мулоим — ба монанди иконаҳои барномаҳои премиум (Duolingo-и нав, Headspace).</p>
  </header>

  <div class="grid">${rows}
  </div>

  <footer class="foot">
    <p>Ҳар ду услуб аз ҳамон Pollinations.ai (Flux), танҳо prompt фарқ мекунад — нархашон якхела (ройгон).</p>
  </footer>
</section>

<style>
  :root {
    --bg: #f7f5f1;
    --card: #ffffff;
    --ink: #1b211f;
    --sub: #62716b;
    --accent: #0e9c8c;
    --accent-2: #a855f7;
    --accent-soft: rgba(14, 156, 140, 0.10);
    --accent-2-soft: rgba(168, 85, 247, 0.12);
    --border: rgba(27, 33, 31, 0.10);
    --thumb-bg: #eef2f0;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #101613;
      --card: #172420;
      --ink: #eaf3ef;
      --sub: #93a6a0;
      --accent: #34e0c6;
      --accent-2: #c084fc;
      --accent-soft: rgba(52, 224, 198, 0.14);
      --accent-2-soft: rgba(192, 132, 252, 0.16);
      --border: rgba(234, 243, 239, 0.12);
      --thumb-bg: #1d2b26;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --bg: #101613; --card: #172420; --ink: #eaf3ef; --sub: #93a6a0;
    --accent: #34e0c6; --accent-2: #c084fc;
    --accent-soft: rgba(52, 224, 198, 0.14); --accent-2-soft: rgba(192, 132, 252, 0.16);
    --border: rgba(234, 243, 239, 0.12); --thumb-bg: #1d2b26; color-scheme: dark;
  }
  :root[data-theme="light"] {
    --bg: #f7f5f1; --card: #ffffff; --ink: #1b211f; --sub: #62716b;
    --accent: #0e9c8c; --accent-2: #a855f7;
    --accent-soft: rgba(14, 156, 140, 0.10); --accent-2-soft: rgba(168, 85, 247, 0.12);
    --border: rgba(27, 33, 31, 0.10); --thumb-bg: #eef2f0; color-scheme: light;
  }

  * { box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .wrap { max-width: 900px; margin: 0 auto; padding: 48px 24px 64px; }

  .head { max-width: 620px; margin-bottom: 40px; }
  .eyebrow {
    font-size: 12px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase;
    color: var(--accent); margin: 0 0 10px;
  }
  h1 {
    font-size: clamp(24px, 3.2vw, 32px); font-weight: 800; letter-spacing: -0.015em;
    line-height: 1.15; margin: 0 0 14px; text-wrap: balance;
  }
  .sub { font-size: 15px; line-height: 1.6; color: var(--sub); margin: 0; }

  .grid { display: flex; flex-direction: column; gap: 20px; }

  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    align-items: center;
    gap: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 16px;
  }

  .slot { position: relative; }
  .thumb {
    aspect-ratio: 1 / 1;
    background: var(--thumb-bg);
    border-radius: 14px;
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }

  .tag {
    position: absolute; top: 10px; left: 10px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 999px;
    background: var(--accent-soft); color: var(--accent);
  }
  .tag-new { background: var(--accent-2-soft); color: var(--accent-2); }

  .label {
    display: flex; flex-direction: column; gap: 4px;
    min-width: 90px; padding-left: 4px;
  }
  .word { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
  .tj { font-size: 13px; color: var(--sub); font-weight: 500; }

  .foot { margin-top: 32px; padding-top: 18px; border-top: 1px solid var(--border); }
  .foot p { font-size: 13px; color: var(--sub); margin: 0; }

  @media (max-width: 620px) {
    .wrap { padding: 32px 16px 48px; }
    .pair { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
    .label { grid-column: 1 / -1; flex-direction: row; align-items: baseline; gap: 8px; }
  }
</style>
`;

writeFileSync('gallery2.html', html);
console.log('gallery2.html тайёр, ' + (Buffer.byteLength(html) / 1024).toFixed(0) + 'KB');
