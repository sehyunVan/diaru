// 앱 아이콘 — 로고의 D 와 그 옆 별 하나. 그 이상 넣지 않는다.
// 글씨가 로고와 같아야 해서(Nanum Pen Script) 브라우저에서 글꼴을 불러 캔버스로 굽는다.
//   node tools/gen-icon.mjs            # 시안 3종 한 장 + 고른 안(navy)으로 전체 크기
//   node tools/gen-icon.mjs ivory      # 다른 안으로 다시 굽기 (navy | ivory | star)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist/icons');
const EXE = process.env.CHROME || 'C:/Users/sehyu/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const PORT = 9366;
const PICK = (process.argv[2] || 'navy');
const SIZES = [1024, 512, 256, 192, 180, 152, 120, 76, 64, 32, 16];

const proc = spawn(EXE, ['--remote-debugging-port=' + PORT, '--no-first-run', '--allow-file-access-from-files',
  '--disable-gpu', '--user-data-dir=' + path.join(os.tmpdir(), 'diaru-icon-chrome'), 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 80 && !ws; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('file:///' + path.join(ROOT, 'dist/index.html').replaceAll('\\', '/'))}`, { method: 'PUT' })).json();
    if (j.webSocketDebuggerUrl) ws = new WebSocket(j.webSocketDebuggerUrl);
  } catch { await sleep(250); }
}
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(res => { const n = ++id; waiting.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || JSON.stringify(r.result.exceptionDetails).slice(0,300));
  if (r.error) throw new Error('CDP ' + JSON.stringify(r.error).slice(0,200));
  return r.result?.result?.value;
}

// 아이콘 한 장을 그리는 함수 — 브라우저 안에서 돈다.
const DRAW = String.raw`window.__icon=async function(kind,size,k){k=k||1;
 await document.fonts.load('400 '+Math.round(size*0.62)+'px "Nanum Pen Script"');
 await document.fonts.ready;
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
 const navy='#26354f',ivory='#fbf6ec',gold='#c9a24a';
 const bg=g.createLinearGradient(0,0,size,size);
 if(kind==='ivory'){bg.addColorStop(0,'#fdfaf4');bg.addColorStop(1,'#f2e9da')}
 else{bg.addColorStop(0,'#33456a');bg.addColorStop(1,'#1f2c44')}
 g.fillStyle=bg;g.fillRect(0,0,size,size);
 /* 네 갈래 반짝임 — 바깥 꼭지 넷을 중심(0,0)을 제어점 삼아 잇는다. 허리가 중심까지 들어가야 뾰족해진다. */
 const star=(x,y,r,color)=>{g.save();g.translate(x,y);g.fillStyle=color;g.beginPath();
  g.moveTo(0,-r);
  for(let i=1;i<=4;i++){const a=-Math.PI/2+i*Math.PI/2;g.quadraticCurveTo(0,0,Math.cos(a)*r,Math.sin(a)*r)}
  g.closePath();g.fill();g.restore()};
 if(kind==='star'){star(size/2,size/2,size*0.34*k,gold)}
 else{
  const letter='D',fs=Math.round(size*0.64*k);
  g.font='400 '+fs+'px "Nanum Pen Script", cursive';g.textAlign='center';g.textBaseline='alphabetic';
  const m=g.measureText(letter),h=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  g.fillStyle=kind==='ivory'?navy:ivory;
  g.fillText(letter,size*(0.5-0.045*k),size/2+h/2-m.actualBoundingBoxDescent);
  star(size*(0.5+0.275*k),size*(0.5-0.175*k),size*0.105*k,gold);
 }
 return c.toDataURL('image/png')};
`;
await sleep(1200); // 첫 평가가 빠르면 글꼴·페이지가 덜 떠서 한 번 헛돈다
await ev(DRAW);

fs.mkdirSync(OUT, { recursive: true });
const save = (file, dataUrl) => { fs.writeFileSync(path.join(OUT, file), Buffer.from(dataUrl.split(',')[1], 'base64')); };

// 시안 한 장 — 세 가지를 나란히
const sheet = await ev(`(async()=>{const kinds=['navy','ivory','star'],s=256,pad=24;
 const c=document.createElement('canvas');c.width=(s+pad)*kinds.length+pad;c.height=s+pad*2+34;
 const g=c.getContext('2d');g.fillStyle='#e8eaf0';g.fillRect(0,0,c.width,c.height);
 for(let i=0;i<kinds.length;i++){const url=await window.__icon(kinds[i],s);
  const img=new Image();img.src=url;await img.decode();
  const x=pad+i*(s+pad);g.save();g.beginPath();g.roundRect(x,pad,s,s,s*0.22);g.clip();g.drawImage(img,x,pad,s,s);g.restore();
  g.fillStyle='#2a3a57';g.font='18px sans-serif';g.textAlign='center';g.fillText(kinds[i],x+s/2,pad+s+26)}
 return c.toDataURL('image/png')})()`);
save('_candidates.png', sheet);
console.log('시안 3종 ->', path.join(OUT, '_candidates.png'));

for (const size of SIZES) save(`icon-${size}.png`, await ev(`window.__icon('${PICK}',${size})`));
// 안드로이드 마스킹용 — 가장자리가 잘려도 글자가 살아남게 여백을 더 준다
save('icon-maskable-512.png', await ev(`window.__icon('${PICK}',512,0.74)`));
console.log('아이콘', SIZES.length + 1, '장 ->', OUT, '(' + PICK + ')');

ws.close(); proc.kill();
