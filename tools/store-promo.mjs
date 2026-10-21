/* 홍보 그림 한 장 → 스토어가 요구하는 화소들.  node tools/store-promo.mjs
   원본: assets/src/store-promo.png (1536×1024, tools/gen-promo.mjs 가 굽는다)
   로고: assets/src/logo.png (tools/gen-logo.mjs 가 진짜 글꼴로 찍는다)

   **크기가 전부다.** 스토어는 1px 만 달라도 안 받는다.

       1024×500    Play 그래픽 이미지(피처 그래픽) — 로고를 얹는 유일한 장
       3840×1646   App Store 헤더
       5244×2950   App Store 헤더 대체 규격
       1920×1280   App Store 검색 결과
       3840×2560   App Store 검색 결과 대체 규격
       1024×1024   App Store 앱 아이콘 (dist/icons 에서 가져와 **알파를 없앤다**)
        512×512    Play 앱 아이콘 (dist/icons 에서 그대로)

   원본이 3:2 라 요구 규격은 전부 그보다 납작하다 → **가로는 안 잘리고 위아래만 잘린다.**
   그래서 왼쪽에 비워 둔 자리가 어느 크기에서도 남는다(gen-promo.mjs 의 프롬프트가 그렇게 시킨다).
   애플은 투명이 있는 그림을 거부하고 Play 도 피처 그래픽은 불투명을 요구한다 — 알파는 전부 눌러 없앤다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('C:/Users/sehyu/playground/subway-rpg/poc/node_modules/sharp');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MASTER = path.join(ROOT, 'assets/src/store-promo.png');
const LOGO = path.join(ROOT, 'assets/src/logo.png');
const BG = { r: 240, g: 236, b: 227, alpha: 1 };   /* 원본 린넨과 같은 톤 */

const cut = (w, h) => sharp(MASTER).resize(w, h, { fit: 'cover', position: 'center' }).flatten({ background: BG });
const out = (...p) => path.join(ROOT, 'site', ...p);
fs.mkdirSync(out('play'), { recursive: true });
fs.mkdirSync(out('appstore/promo'), { recursive: true });

/* ① Play 그래픽 이미지 1024×500 — 비워 둔 왼쪽에 로고를.
   Play 는 이 그림을 잘라 쓰는 자리가 있어서(추천 배너·TV) 글자를 테두리에서 넉넉히 떼어 둔다. */
{
  const base = await cut(1024, 500).png().toBuffer();
  const logo = await sharp(LOGO).resize({ width: 404 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  await sharp(base)
    .composite([{ input: logo, left: 64, top: Math.round((500 - lm.height) / 2) }])
    .flatten({ background: BG }).removeAlpha().png({ compressionLevel: 9 })
    .toFile(out('play', 'feature-graphic-1024x500.png'));
}

/* ② App Store 홍보 자리 — 글자는 넣지 않는다. 스토어가 그 위에 제 글자를 얹는다 */
const APPSTORE = [[3840, 1646, 'header-3840x1646'], [5244, 2950, 'header-5244x2950'],
                  [1920, 1280, 'search-1920x1280'], [3840, 2560, 'search-3840x2560']];
for (const [w, h, name] of APPSTORE)
  await cut(w, h).removeAlpha().png({ compressionLevel: 9 }).toFile(out('appstore/promo', name + '.png'));

/* ③ 아이콘은 이미 구운 것을 제자리에 모아 둔다 — 제출할 때 한 폴더에서 다 꺼내게.
   **애플은 투명이 있는 아이콘을 거부한다**(SHIPPING.md). 그래서 1024 는 흰 바탕에 눌러 붙인다. */
await sharp(path.join(ROOT, 'dist/icons/icon-1024.png'))
  .flatten({ background: '#ffffff' }).removeAlpha().png({ compressionLevel: 9 })
  .toFile(out('appstore/icon-1024x1024.png'));
fs.copyFileSync(path.join(ROOT, 'dist/icons/icon-512.png'), out('play/icon-512x512.png'));

for (const f of [out('play/feature-graphic-1024x500.png'), out('play/icon-512x512.png'), out('appstore/icon-1024x1024.png'),
                 ...APPSTORE.map(([, , n]) => out('appstore/promo', n + '.png'))]) {
  const m = await sharp(f).metadata();
  console.log(path.relative(ROOT, f).split(path.sep).join('/').padEnd(46), `${m.width}×${m.height}  알파 ${m.hasAlpha ? '있음' : '없음'}`);
}
