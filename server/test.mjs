// 서버 한 바퀴 — 코드 받고, 들어오고, 아이디 잡고(중복 거부), 친구 맺고 끊고 차단한다.
//   node server/test.mjs            # 서버를 직접 띄워서 검사하고 끈다
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3100 + (process.pid % 300);
const DATA = path.join(os.tmpdir(), 'diaru-test-' + process.pid + '.json');
const base = `http://127.0.0.1:${PORT}`;
let pass = 0, fail = 0;
const ok = (cond, what, extra = '') => { cond ? pass++ : fail++; console.log((cond ? '  ok  ' : '  ✗   ') + what + (extra ? ' — ' + extra : '')); };

const proc = spawn(process.execPath, [path.join(ROOT, 'server/diaru.mjs')],
  { env: { ...process.env, PORT: String(PORT), DATA, DEV: '1' }, stdio: ['ignore', 'pipe', 'inherit'] });
proc.stdout.on('data', d => { if (process.env.LOUD) process.stdout.write('[서버] ' + d); });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function call(method, p, body, token) {
  const r = await fetch(base + p, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}
async function login(email) {
  const req = await call('POST', '/api/auth/request', { email });
  const ver = await call('POST', '/api/auth/verify', { email, code: req.json.code });
  return { token: ver.json.token, me: ver.json.me, code: req.json.code };
}

for (let i = 0; i < 60; i++) { try { const r = await fetch(base + '/api/health'); if (r.ok) break; } catch {} await sleep(150); }

/* 로그인 */
const bad = await call('POST', '/api/auth/request', { email: '그냥문자' });
ok(bad.status === 400, '엉뚱한 이메일은 거절');
const req = await call('POST', '/api/auth/request', { email: 'A@Example.com ' });
ok(req.status === 200 && /^\d{6}$/.test(req.json.code || ''), '코드 여섯 자리 발급');
const wrong = await call('POST', '/api/auth/verify', { email: 'a@example.com', code: '000000' });
ok(wrong.status === 400, '틀린 코드는 거절');
const first = await call('POST', '/api/auth/verify', { email: 'a@example.com', code: req.json.code });
ok(first.status === 200 && first.json.token, '맞는 코드로 토큰 발급');
ok(first.json.me.onboarded === false && /^diaru_/.test(first.json.me.handle), '새 계정은 가입 전 상태', first.json.me.handle);
const again = await call('POST', '/api/auth/verify', { email: 'a@example.com', code: req.json.code });
ok(again.status === 400, '쓴 코드는 두 번 못 쓴다');

const A = first.json.token;
ok((await call('GET', '/api/me', null, A)).json.me.email === 'a@example.com', '내 계정 조회');
ok((await call('GET', '/api/me', null, 'nope')).status === 401, '엉뚱한 토큰은 401');

/* 아이디 — 중복 금지 */
ok((await call('PATCH', '/api/me', { handle: 'AB' }, A)).status === 400, '짧은 아이디 거절');
ok((await call('PATCH', '/api/me', { handle: 'admin' }, A)).status === 400, '예약어 거절');
const mine = await call('PATCH', '/api/me', { handle: '@Sehyun', name: '세현의 기록', onboarded: true }, A);
ok(mine.status === 200 && mine.json.me.handle === 'sehyun', '아이디 잡기(대문자는 내려서)');
ok((await call('GET', '/api/handle?h=sehyun')).json.free === false, '잡은 아이디는 안 비어 있다');
ok((await call('GET', '/api/handle?h=sehyun2')).json.free === true, '안 쓴 아이디는 비어 있다');

const B = (await login('b@example.com')).token;
const dup = await call('PATCH', '/api/me', { handle: 'sehyun' }, B);
ok(dup.status === 409, '남이 쓰는 아이디는 409');
ok((await call('PATCH', '/api/me', { handle: 'bomi', name: '보미', onboarded: true }, B)).status === 200, '다른 아이디는 통과');
ok((await call('PATCH', '/api/me', { handle: 'sehyun' }, A)).status === 200, '내 아이디를 그대로 다시 적는 건 통과');

/* 친구 */
ok((await call('GET', '/api/people?q=bom', null, A)).json.people[0]?.relation === 'none', '검색은 되고 사이는 없음');
ok((await call('GET', '/api/people?q=bom', null, A)).json.people[0]?.bio === undefined, '친구 아니면 소개는 안 준다');
ok((await call('POST', '/api/friends/request', { handle: 'bomi' }, A)).json.relation === 'sent', '신청 보내기');
ok((await call('GET', '/api/friends', null, B)).json.incoming[0]?.handle === 'sehyun', '받은 쪽에 신청이 쌓인다');
ok((await call('GET', '/api/friends', null, A)).json.friends.length === 0, '아직 친구 아님');
ok((await call('POST', '/api/friends/accept', { handle: 'sehyun' }, B)).json.relation === 'friend', '수락');
ok((await call('GET', '/api/friends', null, A)).json.friends[0]?.handle === 'bomi', '양쪽 친구 목록에 들어감');
ok((await call('GET', '/api/people?q=bom', null, A)).json.people[0]?.relation === 'friend', '검색 결과의 사이도 바뀐다');

const C = (await login('c@example.com')).token;
await call('PATCH', '/api/me', { handle: 'cloud', onboarded: true }, C);
await call('POST', '/api/friends/request', { handle: 'sehyun' }, C);
await call('POST', '/api/friends/request', { handle: 'cloud' }, A);
ok((await call('GET', '/api/friends', null, A)).json.friends.some(f => f.handle === 'cloud'), '서로 보내면 바로 친구');

ok((await call('POST', '/api/friends/block', { handle: 'cloud' }, A)).json.relation === 'blocked', '차단');
ok(!(await call('GET', '/api/friends', null, A)).json.friends.some(f => f.handle === 'cloud'), '차단하면 친구에서 빠진다');
ok(!(await call('GET', '/api/people?q=cloud', null, A)).json.people.length, '차단한 사람은 검색에 안 뜬다');
ok(!(await call('GET', '/api/friends', null, C)).json.friends.some(f => f.handle === 'sehyun'), '상대 쪽에서도 끊긴다');
ok((await call('POST', '/api/friends/unblock', { handle: 'cloud' }, A)).json.relation === 'none', '차단 풀기');

/* 실험용 고정 계정 */
const d1 = await call('POST', '/api/auth/request', { email: 'root@diaru.app' });
ok(d1.json.how === 'demo' && d1.json.code === '000000', '실험용은 고정 코드');
ok((await call('POST', '/api/auth/verify', { email: 'root@diaru.app', code: '111111' })).status === 400, '실험용도 코드가 틀리면 거절');
const demo = await call('POST', '/api/auth/verify', { email: 'root@diaru.app', code: '000000' });
ok(demo.status === 200 && demo.json.me.handle === 'root' && demo.json.me.onboarded === true, '실험용은 @root 로 바로 로그인');
const demo2 = await call('POST', '/api/auth/verify', { email: 'root@diaru.app', code: '000000' });
ok(demo2.json.me.id === demo.json.me.id, '다시 들어가도 같은 계정');
ok([400, 409].includes((await call('PATCH', '/api/me', { handle: 'root' }, B)).status), '@root 는 남이 못 가져간다');

/* 이미 아이디가 있는 이메일로 다시 들어오면 그 계정 */
const back = await login('a@example.com');
ok(back.me.handle === 'sehyun' && back.me.onboarded === true, '쓰던 이메일은 쓰던 계정으로');
ok(back.me.name === '세현의 기록', '이름도 그대로 돌려준다');

/* 저장이 진짜 파일로 남는가 */
await sleep(300);
const saved = JSON.parse(fs.readFileSync(DATA, 'utf8'));
ok(Object.keys(saved.users).length === 4 && saved.byHandle.sehyun && saved.byHandle.root, '파일에 그대로 남는다(실험용 포함)');
ok((await call('POST', '/api/auth/logout', {}, A)).json.ok && (await call('GET', '/api/me', null, A)).status === 401, '로그아웃하면 토큰이 죽는다');

/* 계정 삭제 — A 는 위에서 로그아웃했으므로 새 세션으로 본다 */
const A2 = (await login('a@example.com')).token;
const gone = await login('gone@example.com');
await call('PATCH', '/api/me', { handle: 'goner', onboarded: true }, gone.token);
await call('POST', '/api/friends/request', { handle: 'sehyun' }, gone.token);
ok((await call('GET', '/api/friends', null, A2)).json.incoming.some(p => p.handle === 'goner'), '지우기 전엔 신청이 보인다');
ok((await call('DELETE', '/api/me', null, gone.token)).json.gone === true, '계정 삭제');
ok((await call('GET', '/api/me', null, gone.token)).status === 401, '지운 계정의 토큰은 죽는다');
ok(!(await call('GET', '/api/friends', null, A2)).json.incoming.some(p => p.handle === 'goner'), '남의 목록에서도 빠진다');
ok((await call('GET', '/api/handle?h=goner')).json.free === true, '쓰던 아이디가 다시 빈다');
const reborn = await login('gone@example.com');
ok(/^diaru_/.test(reborn.me.handle) && reborn.me.onboarded === false, '같은 메일로 다시 들어오면 새 계정');

console.log(`\n${pass}개 통과${fail ? ` · ${fail}개 실패` : ''}`);
proc.kill();
fs.rmSync(DATA, { force: true });
process.exit(fail ? 1 : 0);
