// Diaru 서버 — 비밀번호 없는 로그인(이메일 코드) · 계정/프로필 · 친구.
// 의존성 없음(Node 내장만). 저장은 JSON 한 파일 + 원자적 쓰기.
//   node server/diaru.mjs                 # 3030 포트, dist/ 도 같이 서빙
//   PORT=8080 DATA=/var/diaru/db.json node server/diaru.mjs
//   DEV=1 → 코드를 응답에 실어 준다(메일 보낼 길이 없을 때만)
//   RESEND_API_KEY + MAIL_FROM 이 있으면 진짜 메일로 보낸다.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const DATA = process.env.DATA || path.join(ROOT, 'server/data/diaru.json');
const PORT = Number(process.env.PORT || 3030);
const DEV = process.env.DEV === '1';
const ORIGIN = process.env.ORIGIN || '*';

/* 실험용 고정 계정 — DEV=1 이거나 DEMO_EMAIL 을 준 경우에만 살아 있다.
   아무 때나 켜 두면 그냥 뒷문이므로, 운영에서는 환경변수를 비워 둔다. */
const DEMO = {
  email: (process.env.DEMO_EMAIL || (DEV ? 'root@diaru.app' : '')).toLowerCase(),
  code: process.env.DEMO_CODE || '000000',
  handle: (process.env.DEMO_HANDLE || 'root').toLowerCase(),
  name: process.env.DEMO_NAME || '실험용',
};
const isDemo = email => !!DEMO.email && email === DEMO.email;

const HANDLE_RE = /^[a-z0-9_]{3,15}$/;
const RESERVED = ['diaru', 'admin', 'root', 'me', 'official', 'support', 'help'];
const CODE_TTL = 10 * 60e3;        // 코드 10분
const SESSION_TTL = 90 * 864e5;    // 세션 90일
const MAX_TRIES = 5;               // 코드 입력 5번
const MAX_CODES_PER_HOUR = 8;

/* ── 저장 ───────────────────────────────────────────── */
const db = load();
function load() {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
  catch { return { users: {}, byEmail: {}, byHandle: {}, codes: {}, sessions: {}, diaries: {} }; }
}
let flushing = null;
function save() {
  if (flushing) return;
  flushing = setTimeout(() => {
    flushing = null;
    fs.mkdirSync(path.dirname(DATA), { recursive: true });
    const tmp = DATA + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DATA);   // 원자적 교체 — 쓰다 죽어도 반쪽 파일이 남지 않는다
  }, 120);
}

const DIARY_DIR = path.join(path.dirname(DATA), 'diaries');
/* 신고는 데이터베이스가 아니라 사람이 읽는 줄글이다 — 한 줄에 하나씩 덧붙인다.
   클라이언트도 같은 사유 목록을 들고 있다(dist/app.js 의 REPORT_REASONS). 글자가 다르면 400 이 난다. */
const REPORTS = path.join(path.dirname(DATA), 'reports.jsonl');
const REPORT_REASONS = ['스팸·광고', '괴롭힘·욕설', '선정적인 내용', '남의 것을 베낌', '그 밖에'];
const safeId = id => String(id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
const diaryPath = (owner, id) => path.join(DIARY_DIR, owner, safeId(id) + '.json');
function readDiary(owner, id) { try { return JSON.parse(fs.readFileSync(diaryPath(owner, id), 'utf8')); } catch { return null; } }
function writeDiary(owner, id, body) {
  fs.mkdirSync(path.join(DIARY_DIR, owner), { recursive: true });
  const p = diaryPath(owner, id);
  fs.writeFileSync(p + '.tmp', JSON.stringify(body));
  fs.renameSync(p + '.tmp', p);
}
function dropDiary(owner, id) { try { fs.unlinkSync(diaryPath(owner, id)); } catch {} }
const cardOfDiary = (id, rec) => ({ id, title: rec.title, date: rec.date, shared: !!rec.shared });
/* 마음과 댓글은 본문과 따로 둔다 — 본문은 사진이 커서 자주 다시 쓰면 손해다 */
const heartsOf = id => (db.hearts = db.hearts || {})[id] || (db.hearts[id] = []);
const commentsOf = id => (db.comments = db.comments || {})[id] || (db.comments[id] = []);
/* 알림 — 받은 사람 쪽에 쌓인다. 내가 한 일은 알리지 않는다. */
function notify(uid, notice) {
  if (!uid) return;
  const list = (db.notices = db.notices || {})[uid] || (db.notices[uid] = []);
  list.unshift({ ...notice, at: now(), seen: false });
  if (list.length > 60) list.length = 60;
}
const noticeFrom = me => ({ by: me.handle, byName: me.name || '' });

function reactions(id, me) {
  const h = heartsOf(id), c = commentsOf(id);
  return { hearts: h.length, hearted: h.includes(me.handle), comments: c.length };
}
/* 볼 수 있는 사람 = 주인이거나, 친구 공개인 기록의 친구 */
function mayTouch(me, id) {
  const rec = (db.diaries || {})[id];
  if (!rec) return null;
  if (rec.owner === me.id) return rec;
  const owner = db.users[rec.owner];
  if (!owner || !rec.shared) return null;
  if (!owner.friends.includes(me.handle) || me.blocked.includes(owner.handle) || owner.blocked.includes(me.handle)) return null;
  return rec;
}

const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const now = () => Date.now();
const id = (n = 16) => crypto.randomBytes(n).toString('hex');

/* ── 메일 ───────────────────────────────────────────── */
async function sendCode(email, code) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) { console.log(`[코드] ${email} → ${code}`); return 'logged'; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [email], subject: `Diaru 확인 코드 ${code}`,
      text: `확인 코드 ${code}\n\nDiaru 앱에 이 코드를 넣어 주세요. 10분 동안 쓸 수 있어요.\n본인이 요청하지 않았다면 그냥 두셔도 됩니다.`,
      html: `<div style="font-family:system-ui,-apple-system,sans-serif;background:#fdfaf4;padding:32px 24px;color:#2a3a57">`
        + `<p style="margin:0 0 18px;font-size:13px;color:#8b8274">Diaru</p>`
        + `<p style="margin:0 0 10px;font-size:14px">확인 코드예요.</p>`
        + `<p style="margin:0 0 18px;font-size:34px;letter-spacing:9px;font-weight:700">${code}</p>`
        + `<p style="margin:0;font-size:12px;color:#8b8274">10분 동안 쓸 수 있어요. 본인이 요청하지 않았다면 그냥 두셔도 됩니다.</p></div>`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) { console.log('[메일 실패]', r.status, (await r.text()).slice(0, 200)); return 'failed'; }
  return 'sent';
}

/* ── 계정 ───────────────────────────────────────────── */
function publicCard(u) { return { handle: u.handle, name: u.name, bio: u.bio, seal: u.seal, cover: u.cover }; }
function selfCard(u) {
  return { ...publicCard(u), id: u.id, email: u.email, onboarded: !!u.onboarded, created: u.created };
}
function userOf(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const s = db.sessions[token];
  if (!s || s.expires < now()) return null;
  return db.users[s.user] || null;
}
function relation(me, other) {
  if (me.blocked?.includes(other.handle)) return 'blocked';
  if (other.blocked?.includes(me.handle)) return 'none';      // 상대가 나를 막았으면 아무 사이도 아닌 것처럼
  if (me.friends?.includes(other.handle)) return 'friend';
  if (me.incoming?.includes(other.handle)) return 'incoming';
  if (me.sent?.includes(other.handle)) return 'sent';
  return 'none';
}
const pull = (arr, v) => { const i = (arr || []).indexOf(v); if (i >= 0) arr.splice(i, 1); };
const push = (arr, v) => { if (!arr.includes(v)) arr.unshift(v); };

/* ── 길 ─────────────────────────────────────────────── */
const routes = {
  'GET /api/health': async () => ({ ok: true, dev: DEV }),

  'POST /api/auth/request': async (req, body) => {
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return [400, { error: '이메일을 확인해주세요.' }];
    if (isDemo(email)) return { sent: true, how: 'demo', ...(DEV ? { code: DEMO.code } : {}) };
    const rec = db.codes[email] || (db.codes[email] = { hour: now(), count: 0 });
    if (now() - rec.hour > 36e5) { rec.hour = now(); rec.count = 0; }
    if (rec.count >= MAX_CODES_PER_HOUR) return [429, { error: '잠시 뒤에 다시 시도해주세요.' }];
    const code = String(crypto.randomInt(100000, 1000000));
    rec.count++; rec.hash = sha(email + code); rec.expires = now() + CODE_TTL; rec.tries = 0;
    save();
    const how = await sendCode(email, code);
    if (how === 'failed') {   /* 보내지 못했으면 보냈다고 하지 않는다 — 기다리게 만드는 게 제일 나쁘다 */
      rec.count--; delete rec.hash;
      return [502, { error: '메일을 보내지 못했어요. 주소를 확인하고 다시 시도해주세요.' }];
    }
    return { sent: true, how, ...(DEV ? { code } : {}) };
  },

  'POST /api/auth/verify': async (req, body) => {
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (isDemo(email)) {
      if (code !== DEMO.code) return [400, { error: '코드가 맞지 않아요.' }];
      let demo = db.users[db.byEmail[email]];
      if (!demo) {
        const uid = id(8);
        demo = db.users[uid] = {
          id: uid, email, handle: DEMO.handle, name: DEMO.name, bio: '', seal: null, cover: null,
          onboarded: true, created: new Date().toISOString(),
          friends: [], sent: [], incoming: [], blocked: [],
        };
        db.byEmail[email] = uid;
        if (!db.byHandle[DEMO.handle]) db.byHandle[DEMO.handle] = uid;   /* 남이 선점했으면 그대로 둔다 */
      }
      const token = id(32);
      db.sessions[token] = { user: demo.id, expires: now() + SESSION_TTL };
      save();
      return { token, me: selfCard(demo), demo: true };
    }
    const rec = db.codes[email];
    if (!rec || !rec.hash || rec.expires < now()) return [400, { error: '코드가 만료됐어요. 다시 받아주세요.' }];
    if (rec.tries >= MAX_TRIES) return [429, { error: '너무 많이 틀렸어요. 코드를 다시 받아주세요.' }];
    rec.tries++;
    if (sha(email + code) !== rec.hash) { save(); return [400, { error: '코드가 맞지 않아요.' }]; }
    delete rec.hash;
    let user = db.users[db.byEmail[email]];
    if (!user) {
      const uid = id(8);
      let handle = 'diaru_' + id(3);
      while (db.byHandle[handle]) handle = 'diaru_' + id(3);
      user = db.users[uid] = {
        id: uid, email, handle, name: '', bio: '', seal: null, cover: null,
        onboarded: false, created: new Date().toISOString(),
        friends: [], sent: [], incoming: [], blocked: [],
      };
      db.byEmail[email] = uid; db.byHandle[handle] = uid;
    }
    rec.count = 0;   /* 들어왔으면 셈을 되돌린다 */
    const token = id(32);
    db.sessions[token] = { user: user.id, expires: now() + SESSION_TTL };
    save();
    return { token, me: selfCard(user) };
  },

  'DELETE /api/me': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    /* 남의 목록에서도 빼고, 색인과 세션까지 치운다 — 되돌릴 수 없다 */
    for (const uid of Object.values(db.byHandle)) {
      const u = db.users[uid]; if (!u || u.id === me.id) continue;
      ['friends', 'sent', 'incoming', 'blocked'].forEach(k => pull(u[k], me.handle));
    }
    for (const [id, rec] of Object.entries(db.diaries || {})) if (rec.owner === me.id) { dropDiary(me.id, id); delete db.diaries[id]; if (db.hearts) delete db.hearts[id]; if (db.comments) delete db.comments[id]; }
    try { fs.rmSync(path.join(DIARY_DIR, me.id), { recursive: true, force: true }); } catch {}
    delete db.byHandle[me.handle];
    delete db.byEmail[me.email];
    delete db.users[me.id];
    for (const [token, s] of Object.entries(db.sessions)) if (s.user === me.id) delete db.sessions[token];
    if (db.notices) delete db.notices[me.id];
    delete db.codes[me.email];   /* 지운 메일은 코드 셈도 새로 */
    save();
    return { gone: true };
  },

  'POST /api/auth/logout': async (req) => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    delete db.sessions[token]; save();
    return { ok: true };
  },

  'GET /api/me': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    return { me: selfCard(me) };
  },

  'PATCH /api/me': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    if (body.handle !== undefined) {
      const hd = String(body.handle).trim().toLowerCase().replace(/^@/, '');
      if (hd === me.handle) { /* 제 아이디를 그대로 다시 보낸 것 — 그냥 통과 */ }
      else if (!HANDLE_RE.test(hd)) return [400, { error: '아이디는 영문 소문자·숫자·밑줄 3~15자예요.' }];
      else if (RESERVED.includes(hd)) return [400, { error: '쓸 수 없는 아이디예요.' }];
      const owner = db.byHandle[hd];
      if (owner && owner !== me.id) return [409, { error: '이미 쓰이고 있는 아이디예요.' }];
      if (hd !== me.handle) { delete db.byHandle[me.handle]; db.byHandle[hd] = me.id; me.handle = hd; }
    }
    for (const k of ['name', 'bio']) if (body[k] !== undefined) me[k] = String(body[k]).slice(0, k === 'bio' ? 60 : 40);
    for (const k of ['seal', 'cover']) if (body[k] !== undefined) me[k] = body[k] === null ? null : String(body[k]).slice(0, 900000);
    if (body.onboarded !== undefined) me.onboarded = !!body.onboarded;
    save();
    return { me: selfCard(me) };
  },

  'GET /api/handle': async (req, body, url) => {
    const hd = String(url.searchParams.get('h') || '').trim().toLowerCase().replace(/^@/, '');
    if (!HANDLE_RE.test(hd)) return { free: false, why: '영문 소문자·숫자·밑줄 3~15자' };
    if (RESERVED.includes(hd)) return { free: false, why: '쓸 수 없는 아이디' };
    return { free: !db.byHandle[hd] };
  },

  'GET /api/people': async (req, body, url) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase().replace(/^@/, '');
    const out = [];
    for (const uid of Object.values(db.byHandle)) {
      const u = db.users[uid];
      if (!u || u.id === me.id) continue;
      if (q && !u.handle.includes(q) && !(u.name || '').toLowerCase().includes(q)) continue;
      const how = relation(me, u);
      if (how === 'blocked') continue;
      /* 비공개가 기본 — 친구가 아니면 이름과 아이디까지만 */
      out.push(how === 'friend' ? { ...publicCard(u), relation: how } : { handle: u.handle, name: u.name, relation: how });
      if (out.length >= 40) break;
    }
    return { people: out };
  },

  'GET /api/diaries': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const out = [];
    for (const [id, rec] of Object.entries(db.diaries || {})) {
      if (rec.owner !== me.id) continue;
      const body = readDiary(me.id, id);
      if (body) out.push({ ...body, ...reactions(id, me) });
    }
    out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return { diaries: out };
  },

  'POST /api/diaries': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const d = body.diary;
    if (!d || typeof d !== 'object' || !safeId(d.id)) return [400, { error: '기록을 읽지 못했어요.' }];
    const id = safeId(d.id);
    db.diaries = db.diaries || {};
    const old = db.diaries[id];
    if (old && old.owner !== me.id) return [403, { error: '남의 기록이에요.' }];
    const clean = { ...d, id };
    writeDiary(me.id, id, clean);
    db.diaries[id] = { owner: me.id, title: String(d.title || ''), date: String(d.date || ''), shared: !!d.shared, updated: now() };
    save();
    return { diary: cardOfDiary(id, db.diaries[id]) };
  },

  'POST /api/diaries/delete': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const id = safeId(body.id);
    const rec = (db.diaries || {})[id];
    if (!rec || rec.owner !== me.id) return [404, { error: '그런 기록이 없어요.' }];
    dropDiary(me.id, id); delete db.diaries[id];
    if (db.hearts) delete db.hearts[id];
    if (db.comments) delete db.comments[id];
    save();
    return { gone: true };
  },

  'POST /api/diaries/heart': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const id = safeId(body.id);
    if (!mayTouch(me, id)) return [403, { error: '볼 수 없는 기록이에요.' }];
    const rec = db.diaries[id];
    const h = heartsOf(id), i = h.indexOf(me.handle);
    if (i >= 0) h.splice(i, 1);
    else { h.unshift(me.handle); if (rec.owner !== me.id) notify(rec.owner, { kind: 'heart', ...noticeFrom(me), diary: id, title: rec.title }); }
    save();
    return reactions(id, me);
  },

  'GET /api/diaries/comments': async (req, body, url) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const id = safeId(url.searchParams.get('id'));
    if (!mayTouch(me, id)) return [403, { error: '볼 수 없는 기록이에요.' }];
    return { ...reactions(id, me), list: commentsOf(id).slice(0, 200), mine: me.handle };
  },

  'POST /api/diaries/comment': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const id = safeId(body.id), text = String(body.text || '').trim().slice(0, 300);
    if (!text) return [400, { error: '할 말을 적어주세요.' }];
    const rec = mayTouch(me, id); if (!rec) return [403, { error: '볼 수 없는 기록이에요.' }];
    const list = commentsOf(id);
    list.unshift({ by: me.handle, name: me.name || '', text, at: now() });
    if (list.length > 200) list.length = 200;
    if (rec.owner !== me.id) notify(rec.owner, { kind: 'comment', ...noticeFrom(me), diary: id, title: rec.title, text });
    save();
    return { ...reactions(id, me), list, mine: me.handle };
  },

  'POST /api/diaries/comment/delete': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const id = safeId(body.id), at = Number(body.at);
    const rec = (db.diaries || {})[id]; if (!rec) return [404, { error: '그런 기록이 없어요.' }];
    const list = commentsOf(id), i = list.findIndex(c => c.at === at);
    if (i < 0) return [404, { error: '그런 말이 없어요.' }];
    if (list[i].by !== me.handle && rec.owner !== me.id) return [403, { error: '지울 수 없어요.' }];
    list.splice(i, 1); save();
    return { ...reactions(id, me), list, mine: me.handle };
  },

  /* 신고 — 남이 올린 것(기록·댓글·사람)에 문제가 있다고 알리는 길.
     차단만 있으면 App Store 1.2 를 못 넘는다: 가린다고 신고가 되는 건 아니라서,
     「우리에게 알리는」 수단이 따로 있어야 한다.
     여기서는 지우지 않는다 — 사람이 읽고 판단하도록 reports.jsonl 에 한 줄씩 쌓는다.
     급한 차단은 클라이언트가 /api/friends/block 을 이어서 부른다. */
  'POST /api/report': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const kind = String(body.kind || '');
    if (!['diary', 'comment', 'person'].includes(kind)) return [400, { error: '무엇을 신고하는지 알 수 없어요.' }];
    const reason = String(body.reason || '');
    if (!REPORT_REASONS.includes(reason)) return [400, { error: '사유를 골라 주세요.' }];
    const today = new Date().toISOString().slice(0, 10);
    const tally = (db.reportTally = db.reportTally || {});
    const key = me.id + ':' + today;
    tally[key] = (tally[key] || 0) + 1;
    if (tally[key] > 20) return [429, { error: '오늘은 신고를 너무 많이 보냈어요.' }];
    const row = {
      at: new Date().toISOString(), by: me.handle, kind, reason,
      target: String(body.target || '').slice(0, 80),
      about: String(body.about || '').slice(0, 40),       // 누가 올린 것인지(아는 경우)
      note: String(body.note || '').slice(0, 300),
    };
    try {
      fs.mkdirSync(path.dirname(REPORTS), { recursive: true });
      fs.appendFileSync(REPORTS, JSON.stringify(row) + '\n');
    } catch (e) { console.error('신고를 적지 못했다', e); return [500, { error: '신고를 보내지 못했어요.' }]; }
    console.log('[신고]', row.kind, row.reason, 'by @' + row.by, row.target);
    save();
    return { ok: true, reasons: REPORT_REASONS };
  },

  'GET /api/feed': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const out = [];
    for (const hd of me.friends || []) {
      const friend = db.users[db.byHandle[hd]];
      if (!friend || me.blocked.includes(hd) || friend.blocked.includes(me.handle)) continue;
      for (const [id, rec] of Object.entries(db.diaries || {})) {
        if (rec.owner !== friend.id || !rec.shared) continue;
        const body = readDiary(friend.id, id);
        if (body) out.push({ ...body, author: { handle: friend.handle, name: friend.name }, ...reactions(id, me) });
      }
    }
    out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return { feed: out.slice(0, 40) };
  },

  'GET /api/notices': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const list = (db.notices || {})[me.id] || [];
    return { notices: list.slice(0, 40), unseen: list.filter(n => !n.seen).length };
  },

  'POST /api/notices/seen': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    ((db.notices || {})[me.id] || []).forEach(n => { n.seen = true; });
    save();
    return { unseen: 0 };
  },

  'GET /api/friends': async (req) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const card = hd => { const u = db.users[db.byHandle[hd]]; return u ? { handle: u.handle, name: u.name } : null; };
    const list = arr => (arr || []).map(card).filter(Boolean);
    return {
      friends: (me.friends || []).map(hd => { const u = db.users[db.byHandle[hd]]; return u ? publicCard(u) : null; }).filter(Boolean),
      incoming: list(me.incoming), sent: list(me.sent), blocked: list(me.blocked),
    };
  },

  'POST /api/friends/request': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const other = db.users[db.byHandle[String(body.handle || '').toLowerCase()]];
    if (!other || other.id === me.id) return [404, { error: '그런 사람이 없어요.' }];
    if (me.blocked.includes(other.handle) || other.blocked.includes(me.handle)) return [403, { error: '보낼 수 없어요.' }];
    if (me.friends.includes(other.handle)) return { relation: 'friend' };
    if (me.incoming.includes(other.handle)) {   // 서로 보냈으면 바로 친구
      pull(me.incoming, other.handle); pull(other.sent, me.handle);
      push(me.friends, other.handle); push(other.friends, me.handle);
      notify(other.id, { kind: 'accept', ...noticeFrom(me) });
      save();
      return { relation: 'friend' };
    }
    push(me.sent, other.handle); push(other.incoming, me.handle);
    notify(other.id, { kind: 'request', ...noticeFrom(me) });
    save();
    return { relation: 'sent' };
  },

  'POST /api/friends/accept': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const other = db.users[db.byHandle[String(body.handle || '').toLowerCase()]];
    if (!other) return [404, { error: '그런 사람이 없어요.' }];
    if (!me.incoming.includes(other.handle)) return [400, { error: '받은 신청이 없어요.' }];
    pull(me.incoming, other.handle); pull(other.sent, me.handle);
    push(me.friends, other.handle); push(other.friends, me.handle);
    notify(other.id, { kind: 'accept', ...noticeFrom(me) });
    save();
    return { relation: 'friend' };
  },

  'POST /api/friends/decline': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const hd = String(body.handle || '').toLowerCase(), other = db.users[db.byHandle[hd]];
    pull(me.incoming, hd); if (other) pull(other.sent, me.handle); save();
    return { relation: 'none' };
  },

  'POST /api/friends/remove': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const hd = String(body.handle || '').toLowerCase(), other = db.users[db.byHandle[hd]];
    pull(me.friends, hd); pull(me.sent, hd); pull(me.incoming, hd);
    if (other) { pull(other.friends, me.handle); pull(other.sent, me.handle); pull(other.incoming, me.handle); }
    save();
    return { relation: 'none' };
  },

  'POST /api/friends/block': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    const hd = String(body.handle || '').toLowerCase(), other = db.users[db.byHandle[hd]];
    if (!other) return [404, { error: '그런 사람이 없어요.' }];
    push(me.blocked, hd);
    pull(me.friends, hd); pull(me.sent, hd); pull(me.incoming, hd);
    pull(other.friends, me.handle); pull(other.sent, me.handle); pull(other.incoming, me.handle);
    save();
    return { relation: 'blocked' };
  },

  'POST /api/friends/unblock': async (req, body) => {
    const me = userOf(req); if (!me) return [401, { error: '로그인이 필요해요.' }];
    pull(me.blocked, String(body.handle || '').toLowerCase()); save();
    return { relation: 'none' };
  },
};

/* ── 정적 파일(dist) ────────────────────────────────── */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('없는 길'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': /\.(png|jpe?g|svg)$/i.test(file) ? 'public, max-age=86400' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (ORIGIN !== 'off') {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (!url.pathname.startsWith('/api/')) return serveStatic(req, res, url.pathname);

  const handler = routes[req.method + ' ' + url.pathname];
  if (!handler) { res.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: '없는 길' })); return; }

  let body = {};
  if (req.method !== 'GET') {
    const chunks = []; let size = 0;
    const cap = url.pathname.startsWith('/api/diaries') ? 9e6 : 1.2e6;
    for await (const c of req) { size += c.length; if (size > cap) { res.writeHead(413).end(); return; } chunks.push(c); }
    try { body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; }
    catch { res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: '본문을 읽지 못했어요.' })); return; }
  }
  try {
    const out = await handler(req, body, url);
    const [code, payload] = Array.isArray(out) ? out : [200, out];
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(payload));
  } catch (e) {
    console.error('500', url.pathname, e);
    res.writeHead(500, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: '서버가 잠깐 흔들렸어요.' }));
  }
});

server.listen(PORT, () => console.log(`Diaru 서버 :${PORT} · 저장 ${DATA}${DEV ? ' · DEV(코드를 응답에 실음)' : ''}`));
