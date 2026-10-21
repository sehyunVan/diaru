/* 스토어 스크린샷 — 진짜 앱을 켜서 찍는다.  node tools/store-shots.mjs [--only <폴더끝>] [--shot 01,04]
   나오는 곳: site/appstore/<크기>/ · site/play/<크기>/

   **화소 크기가 전부다.** 한 묶음에 한 장만 어긋나도 업로더가 통째로 되돌린다.
   그래서 뷰포트를 크기/배율로 잡고 deviceScaleFactor 로 곱해 맞춘 뒤, 마지막에 전부 다시 잰다.

       1290×2796   6.9" 아이폰 (세로)
       1284×2778   6.5" 아이폰 — ASC 가 아직 요구할 때가 있다
       1179×2556   중형 디스플레이 아이폰(15.5cm)
       1206×2622   중형 디스플레이 아이폰(15.9cm)
       2064×2752   13" 아이패드 — 빌드가 아이패드를 지원할 때만 필요
       1080×1920   Play 휴대폰
       1440×2560   Play 태블릿 — 태블릿을 지원할 때만

   이 앱은 **세로 전용**이라 전부 세로다. 폰 레이아웃은 CSS 폭 599px 이하에서 나온다
   (style.css 의 --phone-width). 그래서 폰 묶음은 배율을 CSS 폭이 599 아래로 떨어지게 잡는다.

   **실제로 쓰는 화면을 담는다.** 시작 화면만 올리면 2.3.3 으로 잡힌다(SHIPPING.md §2).
   빈 앱은 칸이 비어 보이므로 tools/store-seed.mjs 의 저장본을 심고 찍는다. */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SEED, PLAIN } from './store-seed.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const { chromium } = require('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/playwright');
const sharp = require('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/sharp');

const PORT = 4199;
const URL = `http://127.0.0.1:${PORT}`;

/* [가로, 세로, 뷰포트 배율, 나오는 곳] — 뷰포트 = 크기/배율 이라 화소가 딱 맞는다 */
const SIZES = [
  [1290, 2796, 3, 'site/appstore/iphone-6.9'],
  [1284, 2778, 3, 'site/appstore/iphone-6.5'],
  [1179, 2556, 3, 'site/appstore/iphone-6.1'],
  [1206, 2622, 3, 'site/appstore/iphone-6.3'],
  [2064, 2752, 2, 'site/appstore/ipad-13'],
  [1080, 1920, 2.5, 'site/play/phone'],
  [1440, 2560, 2, 'site/play/tablet'],
];

const enter = async page => { await page.click('#enter-app'); await page.waitForTimeout(500); };
const goPage = sel => async page => { await enter(page); await page.click(sel); await page.waitForTimeout(700); };

/* 저장해 둔 기록을 편집기로 연다 — 홈의 「내 다이어리」 n 번째 카드 */
const openSpread = async (page, n) => {
  await enter(page);
  await page.locator('#home-diaries .diary-card').nth(n).click();
  await page.waitForTimeout(1100);
  /* 종이는 보이는 칸보다 작아 가운데 정렬된다. 스크롤이 생긴 큰 화면에서도 종이가 보이게 */
  await page.locator('.paper-frame').scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(250);
};

const SHOTS = [
  /* 앞 두 장은 **실제로 쓰는 화면**이어야 한다 — 다 꾸민 펼침면, 그리고 거기에 붙이는 중.
     서랍을 열면 종이 위를 덮으므로(bottom:77px · max-height:45dvh) 펼침면 전체와 붙이는 장면은
     한 장에 같이 담기지 않는다. 그래서 둘로 나눴다. */
  ['01-spread', page => openSpread(page, 0)],
  ['02-decorate', async page => {
    await openSpread(page, 2);
    /* 확대하면 한 페이지가 화면을 채운다 — 붙이는 순간은 이 거리에서 본다 */
    await page.click('#zoom-paper');
    await page.waitForTimeout(300);
    await page.click('#show-stickers');
    await page.waitForTimeout(700);
    /* 오른쪽 페이지로 — 앱이 직접 가로로 굴려 준다(choosePage).
       세로로는 못 굴린다: 가운데 정렬된 칸은 위로 넘친 부분이 스크롤 범위 밖이다.
       그래서 이 장에 쓰는 기록은 **오른쪽 페이지 위쪽**에 글·사진·스티커가 모이도록 짜 두었다. */
    await page.click('#select-right');
    await page.waitForTimeout(400);
  }],
  ['03-home', enter],
  ['04-stickers', goPage('[data-goto="stickers"]')],
  ['05-papers', goPage('.bottom-nav [data-page="shop"]')],
  ['06-feed', goPage('.bottom-nav [data-page="feed"]')],
  ['07-profile', goPage('.bottom-nav [data-page="profile"]')],
];

const server = spawn(process.execPath, [path.join(HERE, 'serve.cjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const stop = () => { try { server.kill(); } catch {} };
process.on('exit', stop);
await new Promise(r => setTimeout(r, 900));

const arg = n => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
const only = arg('--only');
const onlyShot = arg('--shot')?.split(',') || null;
const browser = await chromium.launch({ headless: true });
try {
  for (const [W, H, scale, dir] of SIZES) {
    if (only && !dir.endsWith(only)) continue;
    const out = path.join(ROOT, dir);
    fs.mkdirSync(out, { recursive: true });
    for (const [name, setup] of SHOTS) {
      if (onlyShot && !onlyShot.some(x => name.startsWith(x))) continue;
      const page = await browser.newPage({
        viewport: { width: Math.round(W / scale), height: Math.round(H / scale) },
        deviceScaleFactor: scale, isMobile: true, hasTouch: true, locale: 'ko-KR',
      });
      page.setDefaultTimeout(60000);
      page.on('pageerror', e => console.log(`  ${name}: 페이지 오류 ${String(e).split('\n')[0]}`));
      await page.addInitScript(([seed, plain]) => {
        for (const [k, v] of Object.entries(seed)) try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
        for (const [k, v] of Object.entries(plain)) try { localStorage.setItem(k, v); } catch {}
      }, [SEED, PLAIN]);
      await page.goto(URL + '/', { timeout: 30000 });
      /* 글꼴이 늦으면 본문이 투명한 채로 찍힌다(index.html 의 fonts-ready) */
      await page.waitForFunction(() => document.documentElement.classList.contains('fonts-ready'), { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(400);
      await setup(page).catch(e => console.log(`  ${name}: ${String(e).split('\n')[0]}`));
      await page.screenshot({ path: path.join(out, name + '.png') });
      await page.close();
    }
    console.log(`${dir}  ${W}×${H}  ${onlyShot ? onlyShot.join('·') + ' 다시' : SHOTS.length + '장'}`);
  }
} finally { await browser.close(); stop(); }

/* 다시 재 본다 — 요구 화소와 1px 이라도 다르면 올릴 수 없다 */
let bad = 0;
for (const [W, H, , dir] of SIZES) {
  if (only && !dir.endsWith(only)) continue;
  for (const [name] of SHOTS) {
    if (onlyShot && !onlyShot.some(x => name.startsWith(x))) continue;
    const m = await sharp(path.join(ROOT, dir, name + '.png')).metadata();
    if (m.width !== W || m.height !== H) { console.error(`크기가 다르다 ${dir}/${name}: ${m.width}×${m.height}`); bad++; }
  }
}
console.log(bad ? `어긋난 것 ${bad}장` : '모든 묶음의 화소가 요구 크기와 같다');
process.exit(bad ? 1 : 0);
