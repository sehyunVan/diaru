/* 스토어 홍보 그림의 원본 한 장(1536×1024)을 굽는다.  node tools/gen-promo.mjs [--force]
   여기서 나온 한 장을 tools/store-promo.mjs 가 요구 화소로 잘라 낸다 —
   Play 그래픽 이미지(1024×500) · App Store 헤더(3840×1646 · 5244×2950) · 검색 결과(1920×1280 · 3840×2560).

   한 장으로 다 덮으려면 **왼쪽을 비워 두고** 가운데~오른쪽에 물건이 모여 있어야 한다.
   1024×500 은 아주 납작해서 위아래가 많이 잘리고, 1920×1280 은 3:2 라 거의 안 잘린다.
   글자는 넣지 않는다 — 로고는 store-promo.mjs 가 진짜 글꼴로 얹는다(생성 글자는 늘 뭉개진다).

   앱에 실제로 들어 있는 것만 그린다: 펼친 종이 다이어리, 폴라로이드 사진, 수채 스티커,
   마스킹 테이프, 말린 꽃. 사람 손·얼굴·상표·글자는 넣지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/src');
const env = f => Object.fromEntries(fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const KEY = env('C:/Users/sehyu/playground/ask-gpt/.env').OPENAI_API_KEY;

const OUT = path.join(SRC, 'store-promo.png');
/* 레퍼런스는 앱이 쓰는 스티커 시트 — 같은 화풍(얇은 남색 선 + 묽은 수채)으로 끌고 간다 */
const REFS = [path.join(SRC, 'stickers.png')];
const PROMPT =
  'Wide 3:2 overhead flat-lay photograph-style illustration of a Korean paper diary spread, no lettering anywhere. ' +
  'An open cream diary lies on a warm ivory linen desk, its two pages facing up, filled with small polaroid-style ' +
  'photos of a forest, a sunset and a night harbour, each taped down with pale blue washi tape. ' +
  'Scattered around and on the pages: delicate watercolour stickers in the attached style — a tuxedo cat, a daisy, ' +
  'a crescent moon, a blue butterfly, a pink ribbon — plus dried pressed flowers, a thin navy pen and a roll of washi tape. ' +
  'The whole arrangement sits in the RIGHT TWO THIRDS of the frame. ' +
  'The LEFT THIRD is quiet empty linen with soft shadow and nothing on it — a place for a logo. ' +
  'Keep every object inside the middle 70% of the height so flat crops do not cut them. ' +
  'Soft diffused daylight, gentle shadows, muted palette of cream, ivory, dusty blue, sage and faded gold, navy ink accents. ' +
  'Calm Korean stationery mood, tasteful and uncluttered. ' +
  'No text, no lettering, no handwriting, no logo, no watermark, no UI, no hands, no people, no frame, no border.';

if (fs.existsSync(OUT) && !process.argv.includes('--force')) { console.log('skip (exists) — 다시 구우려면 --force'); process.exit(0); }

for (let t = 1; t <= 3; t++) {
  const fd = new FormData();
  fd.append('model', 'gpt-image-2.5-sunburst');
  fd.append('prompt', PROMPT);
  fd.append('size', '1536x1024'); fd.append('n', '1');
  for (const f of REFS) if (fs.existsSync(f)) fd.append('image[]', new Blob([fs.readFileSync(f)], { type: 'image/png' }), path.basename(f));
  const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY }, body: fd });
  if (!r.ok) { console.log('t' + t, 'HTTP', r.status, (await r.text()).slice(0, 300)); continue; }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) { console.log('t' + t, '그림이 안 왔다'); continue; }
  fs.mkdirSync(SRC, { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
  console.log('구움:', path.relative(ROOT, OUT));
  process.exit(0);
}
console.log('세 번 다 실패했다');
process.exit(1);
