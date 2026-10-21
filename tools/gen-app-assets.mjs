/* ============================================================
   gen-app-assets.mjs — 앱 아이콘·스플래시 **원본**을 모은다.
     node tools/gen-app-assets.mjs
     cd mobile && npx @capacitor/assets generate

   여기서 만드는 것은 원본 몇 장뿐이고, 두 플랫폼의 수십 가지 크기는 @capacitor/assets 가 만든다.
     mobile/assets/icon.png             1024×1024  **알파 없음** — 투명이 있으면 애플이 거부한다
     mobile/assets/icon-foreground.png  적응형 아이콘 앞면(여백을 더 둔다 — 안드로이드가 둥글게 깎는다)
     mobile/assets/icon-background.png  적응형 아이콘 뒷면(단색에 가까운 아이보리)
     mobile/assets/splash.png           2732×2732  아이보리 바탕 가운데 같은 마크

   **아이콘을 새로 그리지 않는다.** 2026-10 에 고른 것(별 없음 · D 크게 · 아이보리)이
   site/appstore/icon-1024x1024.png 에 있다 — 그걸 원본으로 쓴다. 다시 그리면 그때 고른 것과 달라진다.
   ============================================================ */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'mobile/assets');
const SRC = path.join(ROOT, 'site/appstore/icon-1024x1024.png');   // 알파를 이미 눌러 없앤 판
const EXE = process.env.CHROME || 'C:/Users/sehyu/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const PORT = 9377;
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync(SRC)) { console.error('아이콘 원본이 없다:', SRC, '— node tools/store-promo.mjs 를 먼저'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const proc = spawn(EXE, ['--remote-debugging-port=' + PORT, '--no-first-run', '--headless=new',
  '--disable-gpu', '--user-data-dir=' + path.join(os.tmpdir(), 'diaru-assets-chrome'), 'about:blank'],
  { stdio: ['ignore', 'ignore', 'ignore'] });

let ws;
for (let i = 0; i < 80 && !ws; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
    if (j.webSocketDebuggerUrl) ws = new WebSocket(j.webSocketDebuggerUrl);
  } catch { await sleep(220); }
}
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(res => { const n = ++id; waiting.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval');
  return r.result?.result?.value;
};

const dataURL = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
await ev(`window.MARK=new Image();MARK.src=${JSON.stringify(dataURL)};MARK.decode()`);

/* 아이보리 바탕을 꽉 채우고(= 알파 없음) 가운데에 마크를 size*ratio 로 앉힌다 */
const bake = (size, ratio, flat) => `(()=>{
  const S=${size}, c=document.createElement('canvas'); c.width=c.height=S;
  const g=c.getContext('2d');
  if(${flat}){ g.fillStyle='#f7f1e4'; g.fillRect(0,0,S,S); }
  else { const bg=g.createLinearGradient(0,0,S,S);
         bg.addColorStop(0,'#fdfaf4'); bg.addColorStop(1,'#f2e9d8');
         g.fillStyle=bg; g.fillRect(0,0,S,S); }
  const w=S*${ratio};
  g.drawImage(MARK,(S-w)/2,(S-w)/2,w,w);
  return c.toDataURL('image/png');
})()`;

const jobs = [
  ['icon.png', 1024, 1.0, false],              // 원본 그대로 — 스토어에 올리는 것과 같은 그림
  ['icon-foreground.png', 1024, 0.68, false],  // 둥글게 깎여도 D 가 안 잘리도록 여백을 더
  ['icon-background.png', 1024, 0.0, true],    // 뒷면은 바탕색만
  ['splash.png', 2732, 0.22, false],           // 첫 화면 — 마크 하나
];
for (const [name, size, ratio, flat] of jobs) {
  const url = await ev(bake(size, ratio, flat));
  fs.writeFileSync(path.join(OUT, name), Buffer.from(url.split(',')[1], 'base64'));
  console.log('  ', name, size + '×' + size, (fs.statSync(path.join(OUT, name)).size / 1024 | 0) + 'KB');
}

ws.close(); proc.kill();
console.log('원본 →', OUT);
console.log('다음: cd mobile && npx @capacitor/assets generate');
