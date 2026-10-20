// 앱에 들어가는 사진 — AI 그림 말고 assets/reference 의 내 사진에서 잘라 굽는다.
// 이미지 라이브러리가 없어서 설치돼 있는 크로미움을 CDP 로 몰아 캔버스로 자른다.
//   node tools/make-photos.mjs            # PICKS 전부 다시
//   node tools/make-photos.mjs sheet      # 레퍼런스 전체를 한 장(연락처 시트)으로
//   node tools/make-photos.mjs dusk cat   # 몇 개만
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = path.join(ROOT, 'assets/reference').replaceAll('\\', '/');
const OUT = path.join(ROOT, 'dist/assets/photos').replaceAll('\\', '/');
const EXE = process.env.CHROME || 'C:/Users/sehyu/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const PORT = 9355;

// 이름: [레퍼런스 번호(연락처 시트 기준), 가로, 세로, 세로 초점%, 가로 초점%]
const PICKS = {
  clouds:   [1,  900, 1200, 50, 50],  // 시작 화면 하늘
  dusk:     [13, 900, 1200, 50, 50],  // 오늘 카드
  harbor:   [18, 1200, 900, 50, 50],  // 프로필 커버
  forest:   [3,  900, 1200, 50, 50],
  cat:      [19, 900,  900, 38, 18],  // 프로필 아바타 — 얼굴로 당긴다
  lanterns: [12, 1200, 900, 50, 50],
  garden:   [15, 1200, 900, 50, 50],
  sky:      [9,  1200, 900, 50, 50],
  street:   [5,  1200, 900, 50, 50],
};

const proc = spawn(EXE, ['--remote-debugging-port=' + PORT, '--no-first-run', '--allow-file-access-from-files',
  '--disable-gpu', '--user-data-dir=' + path.join(os.tmpdir(), 'diaru-photo-chrome'), 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 80 && !ws; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/new?file:///${REF}/`, { method: 'PUT' })).json();
    if (j.webSocketDebuggerUrl) ws = new WebSocket(j.webSocketDebuggerUrl);
  } catch { await sleep(250); }
}
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(res => { const n = ++id; waiting.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval');
  return r.result?.result?.value;
}

const files = fs.readdirSync(REF).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const args = process.argv.slice(2);

if (args[0] === 'sheet') {
  // 어떤 사진이 있는지 한눈에 — 번호가 PICKS 에 쓰는 그 번호다.
  const cols = 4, cell = 400, pad = 10, rows = Math.ceil(files.length / cols);
  const url = await ev(`(async()=>{const files=${JSON.stringify(files)};
    const c=document.createElement('canvas');c.width=${cols * cell + pad * (cols + 1)};c.height=${rows * (cell + 34) + pad};
    const g=c.getContext('2d');g.fillStyle='#1b1f27';g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<files.length;i++){const img=new Image();img.src='file:///${REF}/'+files[i];
      try{await img.decode()}catch(e){continue}
      const x=${pad}+(i%${cols})*(${cell}+${pad}), y=${pad}+Math.floor(i/${cols})*(${cell}+34);
      const r=Math.min(${cell}/img.width,${cell}/img.height);
      g.drawImage(img,x+(${cell}-img.width*r)/2,y+(${cell}-img.height*r)/2,img.width*r,img.height*r);
      g.fillStyle='#cfd6e2';g.font='20px sans-serif';g.textAlign='center';
      g.fillText(String(i+1).padStart(2,'0')+'  '+img.width+'×'+img.height,x+${cell}/2,y+${cell}+24);}
    return c.toDataURL('image/jpeg',0.86)})()`);
  const out = path.join(ROOT, 'assets/contact-sheet.jpg');
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('시트 ->', out);
} else {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, [n, w, h, fy, fx]] of Object.entries(PICKS)) {
    if (args.length && !args.includes(name)) continue;
    const src = files[n - 1];
    if (!src) { console.log(name, '— 레퍼런스', n, '번이 없다'); continue; }
    const url = await ev(`(async()=>{const img=new Image();img.src='file:///${REF}/${src}';await img.decode();
      const c=document.createElement('canvas');c.width=${w};c.height=${h};const g=c.getContext('2d');
      g.imageSmoothingQuality='high';
      const r=Math.max(${w}/img.width,${h}/img.height), w2=img.width*r, h2=img.height*r;
      g.drawImage(img,(${w}-w2)*${fx / 100},(${h}-h2)*${fy / 100},w2,h2);
      return c.toDataURL('image/jpeg',0.84)})()`);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, name + '.jpg'), buf);
    console.log(name + '.jpg', w + '×' + h, (buf.length / 1024 | 0) + 'KB  <-', src);
  }
}
ws.close(); proc.kill();
