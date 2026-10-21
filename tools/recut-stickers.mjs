// 스티커 다시 자르기 — 생성된 시트는 4×4 격자에 딱 맞지 않는다.
// 칸 경계를 넘은 그림은 옆 칸에 끼어 보이고, 자기 몸이 잘리기도 한다.
// 그래서 격자로 자르는 대신 (1) 알파로 그림 덩어리를 찾고 (2) 덩어리를 제 칸으로 모아
// (3) 칸 안에 여백을 두고 다시 앉힌 새 시트를 굽는다. 앱 코드는 그대로 4×4 로 쓰면 된다.
//   node tools/recut-stickers.mjs             # 전부 점검만 (report)
//   node tools/recut-stickers.mjs --write     # 고쳐서 다시 굽기
//   node tools/recut-stickers.mjs --write hand stamp
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist/assets').replaceAll('\\', '/');
const SRC = path.join(ROOT, 'assets/src').replaceAll('\\', '/');
const EXE = process.env.CHROME || 'C:/Users/sehyu/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const PORT = 9400 + (process.pid % 80);

// 팩마다: 파일 · 출력 크기 · 도트는 보간하지 않는다
const SHEETS = [
  { id: 'hand', file: 'stickers.png', size: 1024, smooth: true },
  { id: 'pixel', file: 'stickers-pixel.png', size: 1024, smooth: false },
  { id: 'retro', file: 'stickers-retro.png', size: 768, smooth: true },
  { id: 'ink', file: 'stickers-ink.png', size: 768, smooth: true },
  { id: 'jelly', file: 'stickers-jelly.png', size: 768, smooth: true },
  { id: 'foil', file: 'stickers-foil.png', size: 768, smooth: true },
  { id: 'press', file: 'stickers-press.png', size: 768, smooth: true },
  { id: 'stamp', file: 'stickers-stamp.png', size: 768, smooth: true },
  { id: 'clay', file: 'stickers-clay.png', size: 768, smooth: true },
];

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const FROM_DIST = args.includes('--dist'); // 다시 구운 결과를 점검할 때
const only = args.filter(a => !a.startsWith('--'));

const proc = spawn(EXE, ['--remote-debugging-port=' + PORT, '--no-first-run', '--allow-file-access-from-files',
  '--disable-gpu', '--user-data-dir=' + path.join(os.tmpdir(), 'diaru-recut-' + process.pid), 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 80 && !ws; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/new?file:///${DIST}/`, { method: 'PUT' })).json();
    if (j.webSocketDebuggerUrl) ws = new WebSocket(j.webSocketDebuggerUrl);
  } catch { await sleep(250); }
}
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(res => { const n = ++id; waiting.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
}
await sleep(900);

// 브라우저 쪽 일꾼: 덩어리 찾기 → 칸에 모으기 → 다시 앉히기
await ev(String.raw`window.__recut=async function(url,outSize,smooth,write){
 const img=new Image();img.src=url;await img.decode();
 const W=img.naturalWidth,H=img.naturalHeight;
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
 const data=g.getImageData(0,0,W,H).data;
 /* 빠르게 보려고 알파를 1/4 로 줄여 본다 */
 const S=4,w=Math.ceil(W/S),h=Math.ceil(H/S),mask=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  let hit=0;
  for(let dy=0;dy<S&&!hit;dy++)for(let dx=0;dx<S&&!hit;dx++){
   const px=x*S+dx,py=y*S+dy;if(px>=W||py>=H)continue;
   if(data[(py*W+px)*4+3]>24)hit=1}
  mask[y*w+x]=hit}
 /* 이어진 덩어리 찾기(8방향) */
 const label=new Int32Array(w*h).fill(-1),blobs=[],stack=[];
 for(let i=0;i<w*h;i++){
  if(!mask[i]||label[i]>=0)continue;
  const n=blobs.length;label[i]=n;stack.length=0;stack.push(i);
  let area=0,x0=1e9,y0=1e9,x1=-1,y1=-1,sx=0,sy=0;
  while(stack.length){const p=stack.pop(),px=p%w,py=(p/w)|0;
   area++;sx+=px;sy+=py;
   if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const qx=px+dx,qy=py+dy;if(qx<0||qy<0||qx>=w||qy>=h)continue;
    const q=qy*w+qx;if(mask[q]&&label[q]<0){label[q]=n;stack.push(q)}}}
  blobs.push({area,x0,y0,x1,y1,cx:sx/area,cy:sy/area})}
 const cw=w/4,ch=h/4,cellArea=cw*ch;
 const cells=Array.from({length:16},()=>null);
 const cellOf=(x,y)=>Math.min(3,Math.max(0,Math.floor(y/ch)))*4+Math.min(3,Math.max(0,Math.floor(x/cw)));
 const put=(k,x0,y0,x1,y1,area)=>{const cur=cells[k];
  cells[k]=cur?{x0:Math.min(cur.x0,x0),y0:Math.min(cur.y0,y0),x1:Math.max(cur.x1,x1),y1:Math.max(cur.y1,y1),area:cur.area+area,parts:cur.parts+1}
              :{x0,y0,x1,y1,area,parts:1}};
 const fat=new Set();
 blobs.forEach((b,i)=>{
  if(b.area<=w*h*0.0004)return;                   /* 먼지 */
  if(b.area>cellArea*1.3){fat.add(i);return}      /* 서로 붙어 한 덩어리가 된 것 */
  put(cellOf(b.cx,b.cy),b.x0,b.y0,b.x1,b.y1,b.area)});
 /* 붙은 덩어리는 화소를 칸에 나눠 담는다 — 그 이상 갈라낼 근거가 없다 */
 if(fat.size)for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x;if(!mask[i]||!fat.has(label[i]))continue;
  put(cellOf(x,y),x,y,x,y,1)}
 /* 보고: 칸을 넘었는지 · 비었는지 */
 const report=cells.map((b,k)=>{
  if(!b)return{cell:k,empty:true};
  const col=k%4,row=(k/4)|0;
  const over=(b.x0<col*cw-1)||(b.x1>(col+1)*cw+1)||(b.y0<row*ch-1)||(b.y1>(row+1)*ch+1);
  return{cell:k,parts:b.parts,over,w:Math.round((b.x1-b.x0+1)*S),h:Math.round((b.y1-b.y0+1)*S)}});
 let out=null;
 if(write){
  const cell=outSize/4,pad=cell*0.08,box=cell-pad*2;
  const o=document.createElement('canvas');o.width=o.height=outSize;
  const og=o.getContext('2d');og.imageSmoothingEnabled=smooth;og.imageSmoothingQuality='high';
  cells.forEach((b,k)=>{if(!b)return;
   const col=k%4,row=(k/4)|0;
   /* 줄인 마스크 좌표 → 원본 좌표 (가장자리를 한 칸씩 넉넉히) */
   const sx=Math.max(0,b.x0*S-S),sy=Math.max(0,b.y0*S-S);
   const sw=Math.min(W-sx,(b.x1-b.x0+1)*S+S*2),sh=Math.min(H-sy,(b.y1-b.y0+1)*S+S*2);
   let scale=Math.min(box/sw,box/sh);
   if(!smooth)scale=Math.min(scale,1); /* 도트는 늘리지 않는다 */
   const dw=sw*scale,dh=sh*scale;
   og.drawImage(c,sx,sy,sw,sh,col*cell+(cell-dw)/2,row*cell+(cell-dh)/2,dw,dh)});
  out=o.toDataURL('image/png')}
 return{report,out}}`);

let changed = 0;
for (const s of SHEETS) {
  if (only.length && !only.includes(s.id)) continue;
  const src = (!FROM_DIST && fs.existsSync(path.join(SRC, s.file))) ? SRC + '/' + s.file : DIST + '/' + s.file;
  const { report, out } = await ev(`window.__recut('file:///${src}',${s.size},${s.smooth},${WRITE})`);
  const empty = report.filter(r => r.empty).map(r => r.cell);
  const over = report.filter(r => r.over).map(r => r.cell);
  console.log(`${s.id.padEnd(6)} 빈 칸 ${empty.length ? empty.join(',') : '없음'} · 칸 넘침 ${over.length ? over.join(',') : '없음'}`);
  if (WRITE && out) {
    if (!fs.existsSync(path.join(SRC, s.file))) { fs.mkdirSync(SRC, { recursive: true }); fs.copyFileSync(path.join(DIST, s.file), path.join(SRC, s.file)); }
    fs.writeFileSync(path.join(DIST, s.file), Buffer.from(out.split(',')[1], 'base64'));
    changed++;
  }
}
console.log(WRITE ? `다시 구운 시트 ${changed}장` : '점검만 했다. 고치려면 --write');
ws.close(); proc.kill();
