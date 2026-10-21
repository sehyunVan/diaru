/* 제출 전 검사 — site/ 안의 모든 그림이 **요구 화소**와 같은지 본다.  node tools/store-check.mjs
   결과를 site/manifest.json 에 적는다. 하나라도 어긋나면 1 로 끝난다(exit code).

   스토어가 거부하는 세 가지만 본다:
     ① 화소 크기   한 묶음에 한 장만 달라도 업로더가 통째로 되돌린다
     ② 알파 채널   애플은 투명이 있는 아이콘·스크린샷을 받지 않는다(안드로이드 maskable 만 예외)
     ③ 장수        App Store 는 크기마다 1–10장, Play 는 휴대폰 2–8장 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/sharp');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');

/* [경로, 가로, 세로, 최소 장수, 최대 장수, 알파 허용] — 이 앱은 세로 전용이라 전부 세로다 */
const SPEC = [
  ['appstore/iphone-6.9', 1290, 2796, 1, 10, false],
  ['appstore/iphone-6.5', 1284, 2778, 1, 10, false],
  ['appstore/iphone-6.1', 1179, 2556, 1, 10, false],
  ['appstore/iphone-6.3', 1206, 2622, 1, 10, false],
  ['appstore/ipad-13', 2064, 2752, 1, 10, false],
  ['play/phone', 1080, 1920, 2, 8, false],
  ['play/tablet', 1440, 2560, 2, 8, false],
  ['appstore/promo/header-3840x1646.png', 3840, 1646, 1, 1, false],
  ['appstore/promo/header-5244x2950.png', 5244, 2950, 1, 1, false],
  ['appstore/promo/search-1920x1280.png', 1920, 1280, 1, 1, false],
  ['appstore/promo/search-3840x2560.png', 3840, 2560, 1, 1, false],
  ['appstore/icon-1024x1024.png', 1024, 1024, 1, 1, false],
  ['play/icon-512x512.png', 512, 512, 1, 1, true],
  ['play/feature-graphic-1024x500.png', 1024, 500, 1, 1, false],
];

/* 앱에 들어가는 아이콘(홈 화면·파비콘)도 같은 자로 잰다 */
const ICONS = [
  ['dist/icons/icon-1024.png', 1024, 1024, true], ['dist/icons/icon-512.png', 512, 512, true],
  ['dist/icons/icon-256.png', 256, 256, true], ['dist/icons/icon-192.png', 192, 192, true],
  ['dist/icons/icon-180.png', 180, 180, true], ['dist/icons/icon-152.png', 152, 152, true],
  ['dist/icons/icon-120.png', 120, 120, true], ['dist/icons/icon-76.png', 76, 76, true],
  ['dist/icons/icon-64.png', 64, 64, true], ['dist/icons/icon-32.png', 32, 32, true],
  ['dist/icons/icon-16.png', 16, 16, true], ['dist/icons/icon-maskable-512.png', 512, 512, true],
];

const bad = [];
const manifest = { generated: new Date().toISOString().slice(0, 10), groups: [], icons: [] };

for (const [rel, w, h, min, max, alphaOk] of SPEC) {
  const abs = path.join(SITE, rel);
  const isDir = fs.existsSync(abs) && fs.statSync(abs).isDirectory();
  const files = isDir ? fs.readdirSync(abs).filter(f => /\.png$/i.test(f)).sort() : [path.basename(rel)];
  const dir = isDir ? abs : path.dirname(abs);
  if (!isDir && !fs.existsSync(abs)) { bad.push(`${rel}: 파일이 없다`); continue; }
  if (files.length < min || files.length > max) bad.push(`${rel}: ${files.length}장 (요구 ${min}–${max})`);
  const entries = [];
  for (const f of files) {
    const m = await sharp(path.join(dir, f)).metadata();
    const size = fs.statSync(path.join(dir, f)).size;
    if (m.width !== w || m.height !== h) bad.push(`${rel}/${f}: ${m.width}×${m.height} (요구 ${w}×${h})`);
    if (m.hasAlpha && !alphaOk) bad.push(`${rel}/${f}: 알파 채널이 있다`);
    entries.push({ file: f, px: `${m.width}×${m.height}`, alpha: !!m.hasAlpha, kb: Math.round(size / 1024) });
  }
  manifest.groups.push({ path: rel, required: `${w}×${h}`, count: entries.length, files: entries });
}

for (const [rel, w, h, alphaOk] of ICONS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { bad.push(`${rel}: 파일이 없다`); continue; }
  const m = await sharp(abs).metadata();
  if (m.width !== w || m.height !== h) bad.push(`${rel}: ${m.width}×${m.height} (요구 ${w}×${h})`);
  if (m.hasAlpha && !alphaOk) bad.push(`${rel}: 알파 채널이 있다`);
  manifest.icons.push({ file: rel, px: `${m.width}×${m.height}`, alpha: !!m.hasAlpha, kb: Math.round(fs.statSync(abs).size / 1024) });
}

/* Play 는 휴대폰 스크린샷의 **가로:세로 비가 2:1 안**이어야 한다 — 1080×1920 은 1:1.78 로 통과한다.
   App Store 는 칸마다 크기가 못 박혀 있어 위에서 이미 걸러진다. */

manifest.ok = bad.length === 0;
manifest.problems = bad;
fs.writeFileSync(path.join(SITE, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

for (const g of manifest.groups) console.log(`${g.path.padEnd(40)} ${g.required.padEnd(11)} ${g.count}장`);
console.log(bad.length ? `\n어긋난 것 ${bad.length}:\n  ` + bad.join('\n  ') : '\n모든 그림이 요구 화소·형식과 같다 → site/manifest.json');
process.exit(bad.length ? 1 : 0);
