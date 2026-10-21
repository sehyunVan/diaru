// dist/ 를 그대로 내주는 로컬 정적 서버. 스크린샷 도구가 띄운다.
//   node tools/serve.cjs          # http://localhost:4199
//   PORT=4200 node tools/serve.cjs
// api/* 는 일부러 404 를 준다 — 앱이 「서버 없음」으로 판단해 이 기기 저장(localStorage)으로 돈다.
// 스크린샷은 심어 둔 저장본을 그려야 하므로, 서버가 있으면 오히려 그것이 덮어쓴다.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'dist');
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.join(ROOT, rel);
  const inside = path.relative(ROOT, file).replace(/\\/g, '/');
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || inside.startsWith('..') || path.isAbsolute(inside) || !fs.existsSync(file)) {
    res.writeHead(404); return res.end('Not found');
  }
  res.setHeader('Content-Type', type + (type.startsWith('text/') ? '; charset=utf-8' : ''));
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT) || 4199, () => {
  console.log('http://localhost:' + (Number(process.env.PORT) || 4199));
});
