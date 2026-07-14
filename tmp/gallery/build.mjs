import { readFileSync, writeFileSync } from 'fs';

const cards = JSON.parse(readFileSync('cards.json', 'utf8'));

const cardHtml = cards.map((c) => `
        <figure class="card">
          <div class="thumb">
            <img src="${c.dataUri}" alt="${c.word}" loading="lazy" />
          </div>
          <figcaption>
            <span class="pos">${c.pos}</span>
            <span class="word">${c.word}</span>
            <span class="tj">${c.tj}</span>
          </figcaption>
        </figure>`).join('\n');

const html = `<section class="wrap">
  <header class="head">
    <p class="eyebrow">RAMZ Academy — санҷиши сифат</p>
    <h1>Намунаи расмҳо барои машқи «Ин чист?»</h1>
    <p class="sub">8 калимаи A1, аз Pollinations.ai (Flux) бо як prompt-и қолабӣ тавлид шуданд — то якрангии услуб санҷида шавад. Агар писанд ояд, ҳамин тарз ~348 калимаи дигари A1 пур карда мешаванд.</p>
  </header>

  <div class="grid">${cardHtml}
  </div>

  <footer class="foot">
    <p>Ҳар расм 512×512, ~16–24KB (WebP-фишурда дар маҷмӯаи ниҳоӣ хурдтар мешавад).</p>
  </footer>
</section>

<style>
  @font-face {
    font-family: 'RamzUI';
    src: local('Segoe UI'), local('Roboto'), local('Helvetica Neue');
  }

  :root {
    --bg: #f7f5f1;
    --card: #ffffff;
    --ink: #1b211f;
    --sub: #62716b;
    --accent: #0e9c8c;
    --accent-soft: rgba(14, 156, 140, 0.10);
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
      --accent-soft: rgba(52, 224, 198, 0.14);
      --border: rgba(234, 243, 239, 0.12);
      --thumb-bg: #1d2b26;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --bg: #101613;
    --card: #172420;
    --ink: #eaf3ef;
    --sub: #93a6a0;
    --accent: #34e0c6;
    --accent-soft: rgba(52, 224, 198, 0.14);
    --border: rgba(234, 243, 239, 0.12);
    --thumb-bg: #1d2b26;
    color-scheme: dark;
  }
  :root[data-theme="light"] {
    --bg: #f7f5f1;
    --card: #ffffff;
    --ink: #1b211f;
    --sub: #62716b;
    --accent: #0e9c8c;
    --accent-soft: rgba(14, 156, 140, 0.10);
    --border: rgba(27, 33, 31, 0.10);
    --thumb-bg: #eef2f0;
    color-scheme: light;
  }

  * { box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: 'RamzUI', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .wrap {
    max-width: 980px;
    margin: 0 auto;
    padding: 48px 24px 64px;
  }

  .head {
    max-width: 640px;
    margin-bottom: 40px;
  }
  .eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 10px;
  }
  h1 {
    font-size: clamp(26px, 3.4vw, 34px);
    font-weight: 800;
    letter-spacing: -0.015em;
    line-height: 1.15;
    margin: 0 0 14px;
    text-wrap: balance;
  }
  .sub {
    font-size: 15px;
    line-height: 1.6;
    color: var(--sub);
    margin: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .card {
    margin: 0;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .thumb {
    aspect-ratio: 1 / 1;
    background: var(--thumb-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  figcaption {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .pos {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-soft);
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    width: fit-content;
    margin-bottom: 4px;
  }
  .word {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .tj {
    font-size: 14px;
    color: var(--sub);
    font-weight: 500;
  }

  .foot {
    margin-top: 36px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .foot p {
    font-size: 13px;
    color: var(--sub);
    margin: 0;
  }

  @media (max-width: 480px) {
    .wrap { padding: 32px 16px 48px; }
    .grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
  }
</style>
`;

writeFileSync('gallery.html', html);
console.log('gallery.html тайёр, ' + (Buffer.byteLength(html) / 1024).toFixed(0) + 'KB');
