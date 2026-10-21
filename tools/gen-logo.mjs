/* 홍보 그림에 얹을 로고 한 장.  node tools/gen-logo.mjs
   나오는 곳: assets/src/logo.png (투명 배경)

   앱 머리의 로고와 **같은 글꼴·같은 자간·같은 색**이어야 해서, 그림으로 그리지 않고
   진짜 글꼴(Nanum Pen Script)을 브라우저에 불러 그대로 찍는다. 생성 그림의 글자는 늘 뭉개진다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/playwright');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/src/logo.png');

/* style.css 의 .logo 와 같은 값을 10배로 키운 것 — 자간·별 위치까지 같이 커진다 */
const HTML = `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400&display=block" rel="stylesheet">
<style>
 html,body{margin:0;background:transparent}
 #logo{display:inline-block;padding:40px 60px;font-family:'Nanum Pen Script';font-size:350px;
  letter-spacing:10px;color:#22314c;line-height:1;white-space:nowrap}
 #logo span{font-family:serif;font-size:200px;margin-left:50px;vertical-align:top}
 #logo b{display:block;font-family:'Noto Sans KR',sans-serif;font-weight:400;font-size:86px;
  letter-spacing:14px;color:#4d5c6d;margin-top:24px;margin-left:14px}
</style>
<div id="logo">Diaru<span>✶</span><b>오늘의 조각</b></div>`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 2400, height: 900 }, deviceScaleFactor: 1 });
await page.setContent(HTML);
/* check() 는 아직 안 받은 글꼴에 false 를 준다 — 받아 오라고 시킨 뒤 기다린다 */
await page.evaluate(() => Promise.all([
  document.fonts.load('400 350px "Nanum Pen Script"'),
  document.fonts.load('400 86px "Noto Sans KR"'),
]).then(() => document.fonts.ready));
const ok = await page.evaluate(() => document.fonts.check('400 350px "Nanum Pen Script"'));
if (!ok) console.log('글꼴을 못 받았다 — 기본 글씨로 찍힌다');
await page.waitForTimeout(400);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.locator('#logo').screenshot({ path: OUT, omitBackground: true });
await browser.close();

const sharp = require('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/sharp');
const m = await sharp(OUT).metadata();
console.log(path.relative(ROOT, OUT), `${m.width}×${m.height}`, '알파', m.hasAlpha ? '있음' : '없음');
