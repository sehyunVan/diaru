/* ============================================================
   render.mjs — comp.html 을 헤드리스 크로미움으로 프레임마다 찍어 영상으로 굽는다.

     node promo/render.mjs --preview 0.8,3.4,6.2,9.0,11.8,14.5,17.0,19.2
     node promo/render.mjs --frames [--workers 4]
     node promo/render.mjs --encode          # frames + music.wav → promo/out/diaru-showreel.mp4

   REEL.seek(t) 가 t초 화면을 처음부터 세우므로, 크롬 네 대가 나눠 찍어도 같은 그림이다.
   프레임은 저장소 밖(스크래치)에 쌓는다 — 1200장 PNG 를 저장소에 남기지 않는다.
   ============================================================ */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');                     // diary/
const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const OUT = path.resolve(argOf('--out', process.env.REEL_OUT || path.join(os.tmpdir(), 'diaru-reel')));
const FPS = 60, DUR = 20, TOTAL = FPS * DUR;
const WORKERS = Math.max(1, +argOf('--workers', 4) | 0);
const CHROME = process.env.CHROME || 'C:/Users/sehyu/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIME = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };

function serve(port) {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const rel = decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '');
      const f = path.join(ROOT, rel);
      if (!f.startsWith(ROOT)) { r.writeHead(403).end(); return; }
      fs.readFile(f, (e, d) => {
        if (e) { r.writeHead(404).end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        r.end(d);
      });
    }).listen(port, () => res(s));
  });
}

async function openPage(base, port) {
  const dir = path.join(os.tmpdir(), 'diaru-reel-cdp-' + port);
  fs.rmSync(dir, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--mute-audio', '--no-first-run',
    '--force-device-scale-factor=1', '--disable-gpu', '--font-render-hinting=none',
    '--remote-debugging-port=' + port, '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 90 && !ws; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(base + '/promo/comp.html?still=1')}`, { method: 'PUT' })).json();
      if (j.webSocketDebuggerUrl) ws = new WebSocket(j.webSocketDebuggerUrl);
    } catch { await sleep(220); }
  }
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const waiting = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
  const send = (method, params = {}) => new Promise(res => { const n = ++id; waiting.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval');
    return r.result?.result?.value;
  };
  /* 글꼴과 사진이 다 뜬 뒤에 찍는다 — 첫 장이 비어 나오는 사고가 여기서 난다 */
  for (let i = 0; i < 60; i++) {
    const ok = await ev(`(async()=>{await document.fonts.ready;
      const imgs=[...document.images];
      return imgs.length>0 && imgs.every(i=>i.complete&&i.naturalWidth>0) && !!window.REEL})()`).catch(() => false);
    if (ok) break;
    await sleep(250);
  }
  await ev('REEL.seek(0)');
  await send('Page.captureScreenshot', { format: 'png' });   // 첫 장은 버린다(아직 덜 그려진 화면이 나온다)
  return { send, ev, kill: () => { try { ws.close(); } catch {} chrome.kill(); } };
}

const shot = async (page, file) => {
  const r = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const port = 7300 + (process.pid % 200);
  const server = await serve(port);
  const base = `http://127.0.0.1:${port}`;

  if (has('--preview')) {
    const times = (argOf('--preview', '1,5,9,13,17') + '').split(',').map(Number);
    const dir = path.join(OUT, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(base, 9500);
    for (const t of times) {
      await page.ev(`REEL.seek(${t})`);
      await sleep(90);
      await shot(page, path.join(dir, 't' + String(t).replace('.', '_') + '.png'));
      console.log('  📸', t + 's');
    }
    page.kill(); server.close();
    console.log('미리보기 →', dir);
    return;
  }

  if (has('--frames')) {
    const dir = path.join(OUT, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    const chunk = Math.ceil(TOTAL / WORKERS);
    const started = Date.now();
    await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
      const page = await openPage(base, 9520 + w * 3);
      const from = w * chunk, to = Math.min(TOTAL, from + chunk);
      for (let f = from; f < to; f++) {
        const file = path.join(dir, String(f).padStart(5, "0") + ".png");
        /* 이미 찍힌 장은 건너뛴다 — 중간에 끊겨도 이어서 구울 수 있다 */
        if (!has("--redo") && fs.existsSync(file) && fs.statSync(file).size > 1000) continue;
        await page.ev(`REEL.seek(${(f / FPS).toFixed(5)})`);
        await shot(page, file);
        if (f % 60 === 0) console.log(`  ${w}번: ${f}/${TOTAL}`);
      }
      page.kill();
    }));
    server.close();
    const n = fs.readdirSync(dir).filter(f => f.endsWith('.png')).length;
    console.log(`프레임 ${n}장 · ${((Date.now() - started) / 1000 | 0)}초 →`, dir);
    return;
  }

  if (has('--encode')) {
    server.close();
    const ff = process.env.FFMPEG;
    if (!ff || !fs.existsSync(ff)) throw new Error('ffmpeg 를 못 찾았다 — FFMPEG=경로 로 알려 달라');
    const dir = path.join(OUT, 'frames');
    const music = path.join(OUT, 'music.wav');
    const outDir = path.join(HERE, 'out');
    fs.mkdirSync(outDir, { recursive: true });
    const mp4 = path.join(outDir, 'diaru-showreel.mp4');
    const args = ['-y', '-framerate', String(FPS), '-i', path.join(dir, '%05d.png')];
    if (fs.existsSync(music)) args.push('-i', music);
    args.push('-c:v', 'libx264', '-profile:v', 'high', '-crf', '17', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS));
    if (fs.existsSync(music)) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    args.push(mp4);
    execFileSync(ff, args, { stdio: 'inherit' });
    console.log('완성 →', mp4, (fs.statSync(mp4).size / 1e6).toFixed(1) + 'MB');
    return;
  }

  console.log('무엇을 할지 알려 달라: --preview | --frames | --encode');
  server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
