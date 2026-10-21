// 스티커 팩 — 한 장에 4×4=16개. 팩마다 화풍이 완전히 다르다.
// 기존 assets/stickers.png(손그림 수채)은 흰 배경 + multiply 로 쓰고,
// 여기서 굽는 새 팩은 배경을 투명으로 받아 속지 무늬 위에 그대로 올린다.
//   node tools/gen-stickers.mjs            # 없는 것만
//   node tools/gen-stickers.mjs pixel ink  # 몇 개만
//   node tools/gen-stickers.mjs --force
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist/assets');
const env = f => Object.fromEntries(fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const KEY = env('C:/Users/sehyu/playground/ask-gpt/.env').OPENAI_API_KEY;

// 격자 규칙은 모든 팩이 같다 — 앱이 400% 스프라이트로 자르기 때문에 어긋나면 못 쓴다.
const GRID =
  'Square sticker sprite sheet, EXACTLY 4 columns and 4 rows of equal square cells (16 stickers total), ' +
  'no grid lines, no frames, no labels, no text, no watermark, fully transparent background. ' +
  'Each sticker sits dead center of its own cell, drawn within the central 68% of the cell, ' +
  'with generous empty margins so neighbouring stickers never touch or overlap. ' +
  'All 16 at a similar visual weight. ';

const PACKS = {
  pixel: {
    file: 'stickers-pixel.png',
    prompt: GRID +
      'Style: crisp 16-bit PIXEL ART, chunky visible square pixels, hard aliased edges, no anti-aliasing, ' +
      'limited retro game palette of cream, dusty blue, coral pink, mint and charcoal outlines, 1px highlight dots. ' +
      'Row 1: pixel cat sitting, pixel puppy, pixel chick, pixel frog. ' +
      'Row 2: pixel tulip, pixel cactus in a pot, pixel sunflower, pixel four-leaf clover. ' +
      'Row 3: pixel floppy disk, pixel handheld game console, pixel instant noodle cup, pixel vending machine. ' +
      'Row 4: pixel heart, pixel star, pixel speech bubble, pixel rainbow.',
  },
  retro: {
    file: 'stickers-retro.png',
    prompt: GRID +
      'Style: bold 90s VINYL STICKER art, very thick uniform black outlines, flat saturated fills, ' +
      'tiny hard white gloss highlight, slight offset drop shadow, chunky playful shapes, ' +
      'palette of tangerine, hot pink, electric blue, lemon and black. ' +
      'Row 1: tiger face, duck, panda face, bumblebee. ' +
      'Row 2: daisy, rose, palm tree, lemon slice. ' +
      'Row 3: cassette tape, roller skate, soda cup with straw, rotary phone. ' +
      'Row 4: lightning bolt, rainbow, smiley face, shooting star.',
  },
  ink: {
    file: 'stickers-ink.png',
    prompt: GRID +
      'Style: minimal MONOLINE INK drawing, single consistent hairline stroke in dark charcoal ink, ' +
      'no fills, no shading, no colour at all, lots of white space, elegant restrained hand, ' +
      'like a fine fountain pen sketch in a designer notebook. ' +
      'Row 1: cat walking, small bird, fish, rabbit. ' +
      'Row 2: single stem with leaves, eucalyptus sprig, dandelion, chrysanthemum. ' +
      'Row 3: fountain pen, open book, teacup on saucer, round glasses. ' +
      'Row 4: crescent moon, small four-point star, outline heart, ribbon bow.',
  },
  foil: {
    file: 'stickers-foil.png',
    prompt: GRID +
      'Style: delicate GOLD FOIL LINE ART, single hairline stroke in warm metallic gold with a faint sheen, ' +
      'no fills, no colour other than gold, elegant and airy, like hot-foil stamping on cream stationery. ' +
      'Row 1: cat outline sitting, small bird, butterfly, fish. ' +
      'Row 2: slender branch with leaves, single feather, olive leaf, one blossom. ' +
      'Row 3: antique key, sealed envelope, teacup, open book. ' +
      'Row 4: crescent moon, small constellation of three stars, heart outline, ribbon bow.',
  },
  press: {
    file: 'stickers-press.png',
    prompt: GRID +
      'Style: PRESSED BOTANICAL SPECIMEN, real dried and flattened plants and insects as in a herbarium sheet, ' +
      'slightly translucent petals, faded natural colours, fine visible veins, soft paper-dry texture, ' +
      'photographic realism but flat and pressed, no shadows. ' +
      'Row 1: pressed butterfly, dragonfly, ladybird, small snail shell. ' +
      'Row 2: pressed pansy, baby breath sprig, four-leaf clover, fern frond. ' +
      'Row 3: tea bag with paper tag, torn corner of a letter, length of thread, small button. ' +
      'Row 4: dried rose, dried lavender, single feather, star-shaped maple leaf.',
  },
  stamp: {
    file: 'stickers-stamp.png',
    prompt: GRID +
      'Style: VINTAGE POSTAGE STAMP and rubber ink stamp, perforated stamp edges, aged paper, ' +
      'muted ink in indigo, brick red and sepia, slightly uneven inking as if hand-pressed, ' +
      'small engraved linework, postal and stationery feeling. ' +
      'Row 1: cat postage stamp, bird postage stamp, rabbit rubber stamp, fish rubber stamp. ' +
      'Row 2: flower postage stamp, leaf rubber stamp, tree postage stamp, berry rubber stamp. ' +
      'Row 3: round date postmark, airmail stamp, train postage stamp, coffee cup rubber stamp. ' +
      'Row 4: heart rubber stamp, star postage stamp, moon rubber stamp, ribbon postage stamp.',
  },
  clay: {
    file: 'stickers-clay.png',
    prompt: GRID +
      'Style: soft handmade FELT AND CLAY craft objects, chunky rounded shapes, visible wool fibre and ' +
      'fingerprint clay texture, matte surface, gentle soft shadow, warm muted palette of oatmeal, ' +
      'dusty rose, sage and butter yellow, handmade and cosy. ' +
      'Row 1: felt bear, felt sheep, felt duckling, felt hedgehog. ' +
      'Row 2: clay tulip, felt leaf, clay mushroom, clay acorn. ' +
      'Row 3: clay mug, felt book, pair of socks, clay kettle. ' +
      'Row 4: felt heart, clay star, felt cloud, felt rainbow.',
  },
  jelly: {
    file: 'stickers-jelly.png',
    prompt: GRID +
      'Style: glossy translucent JELLY GUMMY objects, soft rounded volumes, candy-like see-through material, ' +
      'bright specular highlight and subtle inner glow, pastel iridescent palette of peach, lilac, aqua and mint, ' +
      'squishy and cute, soft studio lighting, no harsh outlines. ' +
      'Row 1: jelly cat face, jelly bear face, jelly bunny face, jelly duckling. ' +
      'Row 2: jelly blossom, jelly leaf, pair of cherries, peach. ' +
      'Row 3: milk carton, soft ice cream cone, wrapped candy, soap bubble. ' +
      'Row 4: jelly heart, jelly star, little cloud, water droplet.',
  },
};

const args = process.argv.slice(2), force = args.includes('--force');
const only = args.filter(a => !a.startsWith('--'));
fs.mkdirSync(OUT, { recursive: true });

let made = 0;
for (const [id, pack] of Object.entries(PACKS)) {
  if (only.length && !only.includes(id)) continue;
  const out = path.join(OUT, pack.file);
  if (fs.existsSync(out) && !force) { console.log('skip', id); continue; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-2.5-sunburst', prompt: pack.prompt,
        size: '1024x1024', n: 1, background: 'transparent', output_format: 'png',
      }),
    });
    if (!r.ok) { console.log(id, 'HTTP', r.status, (await r.text()).slice(0, 200)); continue; }
    const b64 = (await r.json()).data?.[0]?.b64_json;
    if (!b64) { console.log(id, 'no image'); continue; }
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log('OK', pack.file, (fs.statSync(out).size / 1024 | 0) + 'KB');
    made++;
    break;
  }
}
console.log('새로 구운 스티커 팩', made + '장');
