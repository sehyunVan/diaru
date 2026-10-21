/* ============================================================
   reel.js — Diaru 쇼릴의 동작 전부. CSS 애니메이션은 쓰지 않는다.
   REEL.seek(t) 가 t초의 화면을 처음부터 다시 세우므로,
   크롬 여러 대가 프레임을 나눠 찍어도 같은 그림이 나온다.
   ============================================================ */
(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DUR = 20;

/* ── 시간과 완급 ───────────────────────────────────── */
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const seg = (t, a, b) => clamp((t - a) / (b - a));           // 구간 안의 진행도
const mix = (a, b, p) => a + (b - a) * p;
const E = {
  out: p => 1 - Math.pow(1 - p, 3),
  outQuint: p => 1 - Math.pow(1 - p, 5),
  inOut: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  outExpo: p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p),
  outBack: p => 1 + 2.2 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2),
  outElastic: p => p === 0 || p === 1 ? p : Math.pow(2, -9 * p) * Math.sin((p * 10 - .75) * 2.1) + 1,
  inOutExpo: p => p === 0 ? 0 : p === 1 ? 1 : p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2,
};
/* 같은 씨앗이면 같은 난수 — 장면이 매번 똑같이 재현된다 */
const rnd = (() => { let s = 20261021; return () => (s = s * 16807 % 2147483647) / 2147483647; })();
const deck = n => Array.from({ length: n }, rnd);

/* ── 자산 ──────────────────────────────────────────── */
const A = '../dist/assets/';
const PACKS = ['stickers', 'stickers-jelly', 'stickers-retro', 'stickers-press', 'stickers-foil', 'stickers-clay', 'stickers-ink', 'stickers-pixel', 'stickers-stamp'];
const PHOTOS = ['dusk', 'harbor', 'forest', 'clouds', 'garden', 'lanterns', 'street', 'cat', 'sky'].map(n => A + 'photos/' + n + '.jpg');

/* ── 속지 무늬 (앱과 같은 숫자) ────────────────────── */
const ink = h => '#7e7363' + h;
const PU = 1.1;
const u = n => (n * PU).toFixed(2) + 'px';
const PATTERNS = {
  plain: '',
  ruled: `repeating-linear-gradient(${ink('33')} 0 1.4px,transparent 1.4px ${u(44)})`,
  dot: `radial-gradient(${ink('55')} 0 2.2px,transparent 2.4px)`,
  grid: `linear-gradient(${ink('2e')} 0 1.3px,transparent 1.3px),linear-gradient(90deg,${ink('2e')} 0 1.3px,transparent 1.3px)`,
  month: `linear-gradient(${ink('10')} 0 ${u(108)},${ink('59')} ${u(108)} ${u(110)},transparent ${u(110)}),`
       + `repeating-linear-gradient(${ink('33')} 0 1.3px,transparent 1.3px ${u(178)}),`
       + `repeating-linear-gradient(90deg,${ink('2e')} 0 1.3px,transparent 1.3px ${u(150)})`,
};
const PATTERN_SIZE = { dot: `${u(34)} ${u(34)}`, grid: `${u(42)} ${u(42)}` };
const PATTERN_POS = { month: `0 0,0 ${u(110)},0 0` };
const PAPER_NAMES = [['plain', '무지'], ['ruled', '줄글'], ['dot', '땡땡이'], ['grid', '모눈'], ['month', '월간 플래너']];

/* ── 무대 짓기 ─────────────────────────────────────── */
const paper = $('#paper'), pattern = $('#pattern'), chrome = $('#chrome');
const cam = $('#cam'), fx = $('#fx'), fxg = fx.getContext('2d');

/* 글자는 손글씨 글꼴을 쓰고, 왼쪽부터 드러내 '쓰는' 것처럼 보이게 한다.
   (획을 직접 그리면 글꼴과 모양이 어긋난다 — 글꼴을 믿는 쪽이 낫다) */
function penText(host, text, { size, width, height, color = '#26354f', family = 'Nanum Pen Script', weight = 400 }) {
  host.querySelectorAll('svg').forEach(n => n.remove());   /* 호스트 안의 다른 것(펜촉)은 남긴다 */
  host.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${width} ${height}">
    <defs><clipPath id="${host.id}-clip"><rect x="0" y="0" width="0" height="${height}" id="${host.id}-rect"/></clipPath></defs>
    <text x="0" y="${height * 0.72}" font-family="${family}" font-size="${size}" font-weight="${weight}"
      fill="${color}" clip-path="url(#${host.id}-clip)" id="${host.id}-text">${text}</text></svg>`);
  return { rect: document.getElementById(host.id + '-rect'), node: document.getElementById(host.id + '-text') };
}
const wm = penText($('#wordmark'), 'Diaru', { size: 230, width: 760, height: 300 });
const hand = penText($('#handwriting'), '오늘은 좋았다', { size: 150, width: 1100, height: 420, family: 'Gaegu', weight: 700, color: '#2f3f5c' });

/* 스티커 벽 — 아홉 시트 × 16칸에서 골라 12×9 로 세운다 */
const STICKERS = [];
{
  const host = $('#stickers'), cols = 12, rows = 9;
  for (let i = 0; i < cols * rows; i++) {
    const sheet = PACKS[i % PACKS.length], cell = (i * 7) % 16;
    const d = document.createElement('div');
    d.className = 'sticker';
    d.style.backgroundImage = `url(${A}${sheet}.png)`;
    d.style.backgroundPosition = `${(cell % 4) * 100 / 3}% ${Math.floor(cell / 4) * 100 / 3}%`;
    host.append(d);
    STICKERS.push({ el: d, col: i % cols, row: Math.floor(i / cols), r: deck(4) });
  }
}

/* 사진 — 자동 배치가 앉히는 자리(앱의 점수 함수가 고른 모양을 그대로 옮겼다) */
const SHOTS = [
  { src: PHOTOS[0], x: 96, y: 108, w: 330, h: 300, rot: -4 },
  { src: PHOTOS[3], x: 470, y: 86, w: 250, h: 300, rot: 3 },
  { src: PHOTOS[1], x: 760, y: 120, w: 330, h: 250, rot: -2 },
  { src: PHOTOS[2], x: 120, y: 452, w: 300, h: 300, rot: 2 },
  { src: PHOTOS[4], x: 456, y: 430, w: 300, h: 240, rot: -3 },
  { src: PHOTOS[5], x: 800, y: 418, w: 290, h: 300, rot: 4 },
].map(s => {
  const d = document.createElement('div');
  d.className = 'shot';
  d.style.cssText += `left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px`;
  d.innerHTML = `<img src="${s.src}" alt="">`;
  $('#shots').append(d);
  return { ...s, el: d, r: deck(4) };
});

/* 반짝임 */
const SPARKS = Array.from({ length: 14 }, () => {
  const d = document.createElement('div');
  d.className = 'spark';
  d.textContent = rnd() > .5 ? '✦' : '✧';
  $('#sparks').append(d);
  return { el: d, r: deck(5) };
});

$('#faceA').src = PHOTOS[7];
$('#phoneShot').src = 'shots/home.png';

/* 월간 플래너 요일 */
{
  const days = ['일', '월', '화', '수', '목', '금', '토', '메모'];
  chrome.innerHTML = days.map((d, i) =>
    `<span class="${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}" style="left:${i * 12.5}%;width:12.5%;top:3.2%">${d}</span>`).join('');
}

/* ── 장면표 ────────────────────────────────────────── */
const S = {
  word:    [0.0, 2.7],
  papers:  [2.7, 5.4],
  sticker: [5.4, 8.2],
  hand:    [8.2, 10.8],
  layout:  [10.8, 13.6],
  friends: [13.6, 16.4],
  phone:   [16.4, 17.9],
  lock:    [17.9, 20.0],
};
const inScene = (t, k) => t >= S[k][0] && t < S[k][1];
const at = (t, k) => seg(t, S[k][0], S[k][1]);

/* 작은 도움말 */
const show = (el, v) => { el.style.opacity = v; };
const T = (el, s) => { el.style.transform = s; };
const blurPx = v => v > .15 ? `blur(${v.toFixed(2)}px)` : 'none';

function drawChip(t, lines) {
  const chip = $('#chip');
  const live = lines.find(([a, b]) => t >= a && t <= b);
  if (!live) { show(chip, 0); return; }
  const [start, end, num, text] = live;
  const inP = E.outBack(seg(t, start, start + .42)), outP = seg(t, end - .3, end);
  $('#chipNum').textContent = num; $('#chipText').textContent = text;
  show(chip, 1 - outP);
  T(chip, `translateX(-50%) translateY(${mix(34, 0, inP).toFixed(2)}px) scale(${mix(.94, 1, inP).toFixed(3)})`);
}

/* ── 한 프레임 ─────────────────────────────────────── */
function seek(t) {
  t = clamp(t, 0, DUR);
  const L = { paper: $('#L-paper'), word: $('#L-word'), friends: $('#L-friends'), stickers: $('#L-stickers') };
  show(L.stickers, t >= S.sticker[0] - .45 && t < S.hand[0] + .3 ? 1 : 0);

  /* 카메라 — 장면마다 천천히 밀고, 전환에서 살짝 틀어 준다 */
  let camScale = 1, camX = 0, camY = 0, camRot = 0;
  if (inScene(t, 'word'))    { const p = at(t, 'word');    camScale = mix(1.14, 1.02, E.outQuint(p)); camY = mix(26, 0, E.out(p)); }
  if (inScene(t, 'papers'))  { const p = at(t, 'papers');  camScale = mix(1.02, 1.07, p); }
  if (inScene(t, 'sticker')) { const p = at(t, 'sticker'); camScale = mix(1.1, .98, E.outQuint(p)); }
  if (inScene(t, 'hand'))    { const p = at(t, 'hand');    camScale = mix(1.5, 1.34, E.out(p)); camY = mix(60, 30, p); camX = mix(-40, 10, p); }
  if (inScene(t, 'layout'))  { const p = at(t, 'layout');  camScale = mix(1.16, 1.0, E.outQuint(p)); camRot = mix(-1.2, 0, E.out(p)); }
  if (inScene(t, 'friends')) { const p = at(t, 'friends'); camScale = mix(1.0, .95, E.inOut(p)); camX = mix(0, -34, E.inOut(p)); }
  if (inScene(t, 'phone'))   { const p = at(t, 'phone');   camScale = mix(1.06, 1.0, E.out(p)); camX = mix(-70, 0, E.out(p)); }
  if (inScene(t, 'lock'))    { camScale = 1; }
  const tiltX = Math.sin(t * .42) * .9 + (inScene(t, 'layout') ? mix(5, 0, E.out(at(t, 'layout'))) : 0);
  const tiltY = Math.cos(t * .31) * 1.2 + (inScene(t, 'sticker') ? mix(-6, 0, E.outQuint(at(t, 'sticker'))) : 0);
  T(cam, `translate(${camX.toFixed(2)}px,${camY.toFixed(2)}px) scale(${camScale.toFixed(4)}) rotate(${camRot.toFixed(3)}deg) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg)`);

  /* ── 종이 ── */
  const paperOn = t < S.phone[0] + .5;
  show(L.paper, paperOn ? 1 : clamp(1 - seg(t, S.phone[0], S.phone[0] + .45)));
  {
    const rise = E.outExpo(seg(t, .05, 1.5));
    const toPhone = E.inOut(seg(t, S.phone[0], S.phone[0] + .7));
    const s = mix(.86, 1, rise) * mix(1, .42, toPhone);
    const y = mix(70, 0, rise) + mix(0, -30, toPhone);
    T(paper, `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${mix(1.6, 0, rise).toFixed(3)}deg)`);
    paper.style.filter = blurPx(mix(7, 0, E.out(seg(t, .05, .9))));
  }

  /* 무늬 — 다섯 장을 갈아 끼운다 */
  {
    let key = 'plain';
    if (t >= S.papers[0]) {
      const i = Math.min(PAPER_NAMES.length - 1, Math.floor(seg(t, S.papers[0] + .15, S.papers[1] - .25) * PAPER_NAMES.length));
      key = PAPER_NAMES[i][0];
    }
    if (t >= S.sticker[0]) key = 'dot';
    if (t >= S.hand[0]) key = 'ruled';
    if (t >= S.layout[0]) key = 'plain';
    pattern.style.backgroundImage = PATTERNS[key];
    pattern.style.backgroundSize = PATTERN_SIZE[key] || 'auto';
    pattern.style.backgroundPosition = PATTERN_POS[key] || '0 0';
    chrome.style.opacity = key === 'month' ? 1 : 0;
    $('#fold').style.opacity = t >= S.layout[0] ? 1 : key === 'month' ? 1 : .35;
    /* 갈아 끼우는 순간 종이가 한 번 숨을 쉰다 */
    if (inScene(t, 'papers')) {
      const step = seg(t, S.papers[0] + .15, S.papers[1] - .25) * PAPER_NAMES.length;
      const beat = 1 - clamp((step % 1) * 4);
      pattern.style.opacity = mix(.55, 1, 1 - beat);
      paper.style.filter = blurPx(beat * 1.6);
    } else pattern.style.opacity = 1;
  }

  /* ── 글자 ── */
  {
    const p = at(t, 'word');
    const draw = E.inOutExpo(seg(t, .55, 1.9));
    show(L.word, t < S.papers[0] + .35 ? clamp(seg(t, .35, .6)) * (1 - seg(t, S.papers[0] - .15, S.papers[0] + .35)) : 0);
    wm.rect.setAttribute('width', (760 * draw).toFixed(1));
    const nib = $('#nib');
    show(nib, draw > .02 && draw < .99 ? 1 : 0);
    nib.style.left = (760 * draw - 8) + 'px';
    nib.style.top = (300 * .58) + 'px';
    T($('#wordmark'), `translate(-50%,-50%) scale(${mix(1.06, 1, E.out(p)).toFixed(4)})`);
  }

  /* ── 스티커 ── */
  {
    const on = t >= S.sticker[0] - .35 && t < S.hand[0] + .25;
    STICKERS.forEach((s, i) => {
      if (!on) { show(s.el, 0); return; }
      const gapX = 150, gapY = 118;
      const baseX = 60 + s.col * gapX, baseY = 24 + s.row * gapY;
      const delay = (s.col * .021) + (s.row * .035) + s.r[0] * .05;
      const p = E.outBack(seg(t, S.sticker[0] - .2 + delay, S.sticker[0] + .55 + delay));
      const away = E.inOut(seg(t, S.sticker[1] - .55, S.sticker[1] + .1));
      const fromX = mix((s.r[1] - .5) * 2400, 0, p), fromY = mix((s.r[2] - .5) * 1500, 0, p);
      const spin = mix((s.r[3] - .5) * 220, 0, p) + away * (s.r[1] - .5) * 90;
      const sc = mix(.2, 1, p) * mix(1, .3, away);
      s.el.style.left = baseX + 'px'; s.el.style.top = baseY + 'px';
      T(s.el, `translate(${fromX.toFixed(1)}px,${(fromY - away * 420).toFixed(1)}px) rotate(${spin.toFixed(2)}deg) scale(${sc.toFixed(3)})`);
      s.el.style.filter = blurPx((1 - p) * 9 + away * 5);
      show(s.el, clamp(p * 1.4) * (1 - away));
    });
  }

  /* ── 손글씨 ── */
  {
    const p = seg(t, S.hand[0] + .25, S.hand[1] - .35);
    const draw = E.inOut(p);
    $('#handwriting').style.opacity = clamp(seg(t, S.hand[0] + .1, S.hand[0] + .35)) * (1 - seg(t, S.hand[1] - .25, S.hand[1]));
    hand.rect.setAttribute('width', (1240 * draw).toFixed(1));
    const hn = $('#handNib');
    if (hn) {
      const live = draw > .01 && draw < .985;
      hn.style.opacity = live ? 1 : 0;
      hn.style.left = (1240 * draw - 9) + 'px';
      hn.style.top = (430 * .49) + 'px';
    }
  }

  /* ── 사진 자동 배치 ── */
  {
    const on = t >= S.layout[0] - .3 && t < S.phone[0] + .3;
    SHOTS.forEach((s, i) => {
      if (!on) { show(s.el, 0); return; }
      const delay = i * .075;
      const p = E.outQuint(seg(t, S.layout[0] - .1 + delay, S.layout[0] + .85 + delay));
      const slide = E.inOut(seg(t, S.friends[0] - .35, S.friends[0] + .4));
      const fromY = mix(-900 - s.r[0] * 500, 0, p);
      const rot = mix(s.rot - (s.r[1] - .5) * 40, s.rot, p);
      const sc = mix(1.25, 1, p);
      /* 친구 장면에서는 흩어진 사진이 살짝 모여 앉고, 카드가 그 위에 떠서 내려앉는다 */
      const gather = slide * ((s.x - 590) * -.10) , lift = slide * ((s.y - 420) * -.06);
      T(s.el, `translate(${gather.toFixed(1)}px,${(fromY + lift).toFixed(1)}px) rotate(${(rot + slide * (s.rot * .4)).toFixed(2)}deg) scale(${(sc * mix(1, .92, slide)).toFixed(3)})`);
      s.el.style.filter = blurPx((1 - p) * 10);
      show(s.el, clamp(p * 1.6) * (1 - seg(t, S.phone[0] - .35, S.phone[0] - .02)));
    });
  }

  /* ── 친구 ── */
  {
    const p = at(t, 'friends');
    show(L.friends, clamp(seg(t, S.friends[0], S.friends[0] + .3)) * (1 - seg(t, S.friends[1] - .3, S.friends[1])));
    const cardP = E.outBack(seg(t, S.friends[0] + .1, S.friends[0] + .8));
    T($('#cardA'), `translate(${mix(128, 0, cardP).toFixed(1)}px,${mix(74, 0, cardP).toFixed(1)}px) scale(${mix(.88, 1, cardP).toFixed(3)}) rotate(${mix(2.4, 0, cardP).toFixed(2)}deg)`);
    $('#cardA').style.filter = blurPx((1 - cardP) * 7);
    /* 댓글이 한 글자씩 */
    const say = '여기 좋다. 나도 가보고 싶어';
    const typed = Math.round(clamp(seg(t, S.friends[0] + .95, S.friends[0] + 2.0)) * say.length);
    $('#bubbleA').textContent = say.slice(0, typed) + (typed < say.length && Math.floor(t * 6) % 2 ? '|' : '');
    /* 마음 */
    const hp = seg(t, S.friends[0] + .55, S.friends[0] + 1.35);
    const heart = $('#heart'), ring = $('#ring');
    show(heart, hp > 0 && hp < 1 ? clamp(hp * 4) * (1 - clamp((hp - .75) * 4)) : 0);
    T(heart, `translate(${mix(1210, 1120, E.out(hp)).toFixed(1)}px,${mix(1010, 392, E.outQuint(hp)).toFixed(1)}px) scale(${mix(.3, 2.1, E.outBack(hp)).toFixed(3)}) rotate(${mix(-22, 5, hp).toFixed(2)}deg)`);
    const rp = seg(t, S.friends[0] + 1.15, S.friends[0] + 1.75);
    show(ring, rp > 0 && rp < 1 ? (1 - rp) * .8 : 0);
    const rs = mix(24, 430, E.outQuint(rp));
    ring.style.cssText += `;left:${(1150 - rs / 2).toFixed(0)}px;top:${(440 - rs / 2).toFixed(0)}px;width:${rs.toFixed(0)}px;height:${rs.toFixed(0)}px`;
  }

  /* ── 기기 ── */
  {
    const p = at(t, 'phone');
    const on = t >= S.phone[0] - .2 && t < S.lock[0] + .35;
    const ph = $('#phone');
    show(ph, on ? clamp(seg(t, S.phone[0] - .1, S.phone[0] + .35)) * (1 - seg(t, S.lock[0] - .25, S.lock[0] + .1)) : 0);
    const rise = E.outQuint(seg(t, S.phone[0] - .1, S.phone[0] + .9));
    const away = E.inOut(seg(t, S.lock[0] - .4, S.lock[0] + .1));
    T(ph, `translateY(${mix(180, 0, rise).toFixed(1)}px) scale(${(mix(.82, 1, rise) * mix(1, .78, away)).toFixed(4)}) rotate(${mix(2.5, 0, rise).toFixed(3)}deg)`);
    ph.style.filter = blurPx((1 - rise) * 8 + away * 6);
  }

  /* ── 끝 로크업 ── */
  {
    const p = at(t, 'lock');
    const lock = $('#lockup');
    show(lock, clamp(seg(t, S.lock[0], S.lock[0] + .45)));
    const mark = lock.querySelector('.mark');
    T(mark, `scale(${mix(.7, 1, E.outBack(seg(t, S.lock[0], S.lock[0] + .7))).toFixed(3)}) rotate(${mix(-8, 0, E.outBack(seg(t, S.lock[0], S.lock[0] + .8))).toFixed(2)}deg)`);
    const h1 = lock.querySelector('h1'), sub = lock.querySelector('p');
    T(h1, `translateY(${mix(28, 0, E.outExpo(seg(t, S.lock[0] + .25, S.lock[0] + 1.0))).toFixed(1)}px)`);
    show(h1, clamp(seg(t, S.lock[0] + .25, S.lock[0] + .7)));
    T(sub, `translateY(${mix(20, 0, E.outExpo(seg(t, S.lock[0] + .5, S.lock[0] + 1.3))).toFixed(1)}px)`);
    show(sub, clamp(seg(t, S.lock[0] + .5, S.lock[0] + 1.0)));
    sub.style.letterSpacing = mix(26, 10, E.outExpo(seg(t, S.lock[0] + .5, S.lock[0] + 1.6))).toFixed(1) + 'px';
    const url = $('#url');
    if (url) { show(url, clamp(seg(t, S.lock[0] + 1.0, S.lock[0] + 1.5)) * (1 - seg(t, 19.6, 20))); }
    document.body.style.background = t >= S.lock[0] ? '#0b0f16' : '#0d1117';
  }

  /* ── 자막 ── */
  drawChip(t, [
    [S.papers[0] + .25, S.papers[1] - .12, '12', '가지 속지'],
    [S.sticker[0] + .3, S.sticker[1] - .12, '144', '개의 스티커'],
    [S.hand[0] + .3, S.hand[1] - .12, '', '손으로 쓴 글씨 그대로'],
    [S.layout[0] + .35, S.layout[1] - .12, '', '사진을 던지면 알아서 앉는다'],
    [S.friends[0] + .4, S.friends[1] - .15, '', '친구에게만 열리는 기록'],
  ]);

  /* ── 반짝임 ── */
  SPARKS.forEach((s, i) => {
    const born = [0.9, 1.3, 2.4, 5.6, 6.2, 7.4, 9.0, 11.2, 12.4, 14.2, 15.1, 18.0, 18.5, 19.1][i];
    const p = seg(t, born, born + .9);
    const live = p > 0 && p < 1;
    show(s.el, live ? Math.sin(p * Math.PI) * .95 : 0);
    s.el.style.fontSize = (18 + s.r[0] * 36).toFixed(0) + 'px';
    s.el.style.left = (120 + s.r[1] * 1650) + 'px';
    s.el.style.top = (90 + s.r[2] * 880) + 'px';
    T(s.el, `translateY(${mix(14, -22, p).toFixed(1)}px) scale(${mix(.5, 1.25, E.outBack(p)).toFixed(3)}) rotate(${mix(0, 70, p).toFixed(1)}deg)`);
  });

  /* ── 장면 전환의 흰 섬광 ── */
  {
    const cuts = [S.papers[0], S.sticker[0], S.hand[0], S.layout[0], S.friends[0], S.phone[0], S.lock[0]];
    let f = 0;
    cuts.forEach(c => { const p = seg(t, c - .06, c + .20); if (p > 0 && p < 1) f = Math.max(f, Math.sin(p * Math.PI) * .5); });
    $('#flash').style.opacity = f.toFixed(3);
  }

  /* ── 레터박스 ── */
  {
    const open = E.outExpo(seg(t, .1, 1.2)), close = E.inOut(seg(t, 18.6, 19.5));
    const h = mix(104, 0, open) + mix(0, 104, close);
    $$('#bars i').forEach(b => b.style.height = h.toFixed(1) + 'px');
  }

  /* ── 마감: 입자 · 빛샘 · 색수차 ── */
  drawFx(t);
}

/* 필름 느낌은 세게 넣으면 싸구려가 된다 — 입자는 절반만, 빛샘은 전환에만 */
function drawFx(t) {
  fxg.clearRect(0, 0, 1920, 1080);
  /* 빛샘 */
  const cuts = [2.7, 5.4, 8.2, 10.8, 13.6, 16.4, 17.9];
  cuts.forEach((c, i) => {
    const p = seg(t, c - .15, c + .75);
    if (p <= 0 || p >= 1) return;
    const a = Math.sin(p * Math.PI) * .22;
    const x = (i % 2 ? 1920 : 0), y = 300 + (i * 120) % 500;
    const g = fxg.createRadialGradient(x, y, 0, x, y, 900);
    g.addColorStop(0, `rgba(255,228,170,${a.toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,228,170,0)');
    fxg.fillStyle = g; fxg.fillRect(0, 0, 1920, 1080);
  });
  /* 입자 — 시간에 따라 자리가 바뀌되 프레임마다 같은 값 */
  const n = 2600, seed = Math.floor(t * 60);
  let s = (seed * 2654435761) >>> 0;
  const next = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  fxg.globalAlpha = .035;
  fxg.fillStyle = '#fff';
  for (let i = 0; i < n; i++) fxg.fillRect(next() * 1920 | 0, next() * 1080 | 0, 1.6, 1.6);
  fxg.globalAlpha = 1;
}

window.REEL = { seek, DUR, FPS: 60 };
/* 혼자 열어 볼 때만 흐른다 — 캡처는 seek 로만 움직인다 */
if (!location.search.includes('still')) {
  let t0 = null;
  const loop = ts => { if (t0 === null) t0 = ts; seek(((ts - t0) / 1000) % DUR); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
} else seek(parseFloat(new URLSearchParams(location.search).get('t') || '0'));
})();
