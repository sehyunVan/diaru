/* ============================================================
   pack-mobile.mjs — 앱에 담을 웹 번들을 굽는다.

     node tools/pack-mobile.mjs              # dist/ → dist-mobile/
     node tools/pack-mobile.mjs --api http://192.168.0.5:3030   # 집 서버로 시험할 때

   앱 안에서는 출처가 capacitor://localhost 라 `fetch('api/health')` 같은
   상대경로가 **우리 서버에 닿지 않는다.** 그래서 여기서 절대 주소를 한 줄 박는다.
   웹 배포본(dist/)은 건드리지 않는다 — 거기선 지금까지대로 상대경로가 맞다.

   ⚠ 이 주소는 빌드 시점에 박힌다. 서버가 이사하면 **앱을 다시 내야 한다.**
      (RELEASE.md 「서버 주소」 참고)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'dist-mobile');
const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };

export const DEFAULT_API = 'https://diaru.64-227-141-147.sslip.io';
const API = (argOf('--api', process.env.DIARU_API || DEFAULT_API) || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(API)) { console.error('주소가 이상하다:', API); process.exit(1); }

/* 지우고 다시 — 반쯤 남은 옛 파일이 섞이면 「고쳤는데 그대로」가 된다 */
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });

/* 스토어 그림 찍을 때만 쓰는 것들은 앱에 넣지 않는다 */
for (const junk of ['icons/_candidates.png']) fs.rmSync(path.join(OUT, junk), { force: true });

const indexPath = path.join(OUT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const tag = `<script>window.DIARU_API=${JSON.stringify(API)}</script>`;
if (html.includes('window.DIARU_API')) { console.error('이미 박혀 있다 — dist/ 가 오염됐다'); process.exit(1); }
if (!html.includes('<script src="app.js">')) { console.error('app.js 자리를 못 찾았다'); process.exit(1); }
html = html.replace('<script src="app.js">', tag + '<script src="app.js">');

/* 앱 전용 보정(native.css)을 켠다 — 웹 배포본에는 안 걸린다.
   class 는 <html> 에 **처음부터** 박는다. 스크립트로 나중에 붙이면 첫 그림이 한 번 잘못 그려진다. */
if (!/<html lang="ko">/.test(html)) { console.error('<html> 자리를 못 찾았다'); process.exit(1); }
html = html.replace('<html lang="ko">', '<html lang="ko" class="native">');
if (!html.includes('href="theme.css"')) { console.error('theme.css 링크를 못 찾았다'); process.exit(1); }
html = html.replace('<link rel="stylesheet" href="theme.css">',
  '<link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="native.css">');

/* 웹뷰의 제 줌을 끈다 — **앱에서만.**
   iOS 의 WKWebView 는 안드로이드와 달리 핀치·더블탭 확대가 기본으로 열려 있다.
   한 번 확대되면 그 뒤로 화면이 계속 좌우로 밀린다. 그런데 이 앱은 편집기에서
   **자기 핀치 줌을 직접 구현해 쓰므로**, 웹뷰의 줌은 보탬이 아니라 방해다.
   웹(브라우저)에서는 건드리지 않는다 — 거기서 줌을 막는 건 접근성을 깎는 짓이다. */
const VP_OLD = '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
const VP_NEW = '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">';
if (!html.includes(VP_OLD)) { console.error('viewport 메타를 못 찾았다'); process.exit(1); }
html = html.replace(VP_OLD, VP_NEW);
fs.writeFileSync(indexPath, html);

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
const bytes = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? bytes(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);

console.log(`번들 → ${OUT}`);
console.log(`  파일 ${count(OUT)}개 · ${(bytes(OUT) / 1e6).toFixed(1)}MB`);
console.log(`  서버 ${API}`);
