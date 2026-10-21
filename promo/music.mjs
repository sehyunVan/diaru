/* ============================================================
   music.mjs — 쇼릴 사운드트랙을 코드로 합성한다 (의존성 없음).
     node promo/music.mjs [--out <폴더>]   →  <폴더>/music.wav (48k · 16bit · 스테레오 · 20초)

   장면이 바뀌는 순간(2.7 5.4 8.2 10.8 13.6 16.4 17.9)에 종소리와 숨이 걸리고,
   마지막 로크업에서 화음이 한 번 열린다. 음계는 C 장조, 패드는 Cmaj7–Fmaj7–Am7–G.
   ============================================================ */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(argOf('--out', process.env.REEL_OUT || path.join(os.tmpdir(), 'diaru-reel')));
const SR = 48000, DUR = 20, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);

const note = n => 440 * Math.pow(2, (n - 69) / 12);          // MIDI → Hz
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const add = (i, l, r) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };

/* 부드러운 건반 — 배음 몇 개와 지수 감쇠. 때리지 않고 번진다. */
function key(at, midi, { gain = .22, dur = 2.6, pan = 0, detune = 0 } = {}) {
  const f = note(midi) * (1 + detune), start = Math.floor(at * SR), len = Math.floor(dur * SR);
  const parts = [[1, 1], [2, .36], [3, .14], [4.01, .07], [5.02, .035]];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 2.3) * (1 - Math.exp(-t * 180));
    let s = 0;
    for (const [m, a] of parts) s += Math.sin(2 * Math.PI * f * m * t) * a;
    s *= env * gain / 1.6;
    add(start + i, s * (1 - clamp(pan, 0, 1) * .6), s * (1 + clamp(pan, -1, 0) * .6));
  }
}
/* 패드 — 톱니를 살짝 어긋나게 겹쳐 넓게 */
function pad(at, midis, { gain = .07, dur = 3.4 } = {}) {
  const start = Math.floor(at * SR), len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / .9) * Math.exp(-Math.max(0, t - dur * .55) * 1.8);
    let a = 0, b = 0;
    midis.forEach((m, k) => {
      const f = note(m);
      a += Math.sin(2 * Math.PI * f * (1 - .0015) * t + k) * .5;
      b += Math.sin(2 * Math.PI * f * (1 + .0015) * t + k * 1.7) * .5;
    });
    const g = env * gain / midis.length;
    add(start + i, a * g, b * g);
  }
}
/* 종 — 장면이 바뀔 때 한 점 */
function bell(at, midi, { gain = .13, dur = 1.8, pan = 0 } = {}) {
  const f = note(midi), start = Math.floor(at * SR), len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.exp(-t * 4.2);
    const s = (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2.76 * t) * .5
      + Math.sin(2 * Math.PI * f * 5.4 * t) * .22) * env * gain / 1.7;
    add(start + i, s * (1 - clamp(pan, 0, 1) * .7), s * (1 + clamp(pan, -1, 0) * .7));
  }
}
/* 숨 — 걸러낸 잡음. 전환을 밀어 준다 */
function swell(at, dur, gain = .05, rise = true) {
  const start = Math.floor(at * SR), len = Math.floor(dur * SR);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const env = (rise ? Math.pow(p, 2.2) : Math.pow(1 - p, 2.2)) * gain;
    const n = Math.random() * 2 - 1;
    lp += (n - lp) * .035; lp2 += (lp - lp2) * .035;
    add(start + i, lp2 * env, lp2 * env * .92);
  }
}
/* 종이 넘기는 소리 — 짧게 바스락 */
function paper(at, gain = .05) {
  const start = Math.floor(at * SR), len = Math.floor(.22 * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.exp(-t * 26) * gain;
    const n = (Math.random() * 2 - 1);
    lp += (n - lp) * .5;
    add(start + i, lp * env, lp * env * .8);
  }
}

/* ── 곡 ─────────────────────────────────────────────── */
const CUTS = [2.7, 5.4, 8.2, 10.8, 13.6, 16.4, 17.9];
const CHORDS = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]];

/* 패드: 2.5초마다 한 화음 */
for (let i = 0; i * 2.5 < DUR; i++) pad(i * 2.5, CHORDS[i % CHORDS.length], { gain: i < 1 ? .045 : .075, dur: 3.2 });

/* 들어가는 숨 */
swell(0, 2.6, .045, true);

/* 건반 — 느린 아르페지오. 장면이 바뀔수록 음이 올라간다 */
const ARP = [72, 76, 79, 83, 79, 76];
for (let i = 0; i < 34; i++) {
  const at = .9 + i * .55;
  if (at > 18.2) break;
  const lift = at > 13 ? 12 : at > 8 ? 7 : 0;
  key(at, ARP[i % ARP.length] + (lift ? 0 : 0) + (at > 10.8 ? 0 : 0), { gain: .085, dur: 2.2, pan: (i % 2 ? .4 : -.4), detune: (i % 3) * .0004 });
  if (i % 6 === 0) key(at, 48 + (i % 12), { gain: .05, dur: 3.0 });
}

/* 장면 전환 — 종과 종이 */
CUTS.forEach((c, i) => {
  bell(c, [84, 79, 88, 83, 86, 91, 93][i], { gain: .11, pan: i % 2 ? .5 : -.5 });
  paper(c - .04, .045);
  swell(c - .5, .5, .035, true);
});

/* 스티커 벽이 쏟아질 때 — 잔 종을 흩뿌린다 */
for (let i = 0; i < 22; i++) bell(5.5 + i * .052, 88 + (i % 5) * 2, { gain: .035, dur: .7, pan: (i % 2 ? 1 : -1) * .6 });

/* 마지막 로크업 — 화음이 열리고 긴 종 */
pad(17.9, [60, 64, 67, 72], { gain: .1, dur: 2.6 });
key(17.95, 72, { gain: .16, dur: 2.4 });
key(18.1, 76, { gain: .12, dur: 2.3, pan: .3 });
key(18.25, 79, { gain: .1, dur: 2.2, pan: -.3 });
bell(18.0, 96, { gain: .09, dur: 2.0 });
swell(18.6, 1.4, .03, false);

/* ── 마감: 가벼운 잔향과 리미터 ─────────────────────── */
function reverb(buf, delaySec, feedback, mix) {
  const d = Math.floor(delaySec * SR), out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const back = i - d >= 0 ? out[i - d] : 0;
    out[i] = buf[i] + back * feedback;
  }
  for (let i = 0; i < buf.length; i++) buf[i] = buf[i] * (1 - mix) + out[i] * mix;
}
reverb(L, .083, .34, .26); reverb(R, .097, .33, .26);

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = peak > 0 ? Math.min(1, .82 / peak) : 1;
/* 끝에서 부드럽게 닫는다 */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = t < .12 ? t / .12 : t > DUR - .55 ? Math.max(0, (DUR - t) / .55) : 1;
  L[i] = Math.tanh(L[i] * g * fade * 1.6);
  R[i] = Math.tanh(R[i] * g * fade * 1.6);
}
/* 리미터를 지나면 소리가 줄어 있다 — 마지막에 다시 올린다(피크 -1dB) */
let p2 = 0;
for (let i = 0; i < N; i++) p2 = Math.max(p2, Math.abs(L[i]), Math.abs(R[i]));
const g2 = p2 > 0 ? 0.89 / p2 : 1;
for (let i = 0; i < N; i++) { L[i] *= g2; R[i] *= g2; }

/* ── WAV ────────────────────────────────────────────── */
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
}
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, 'music.wav');
fs.writeFileSync(file, buf);
console.log('음악 →', file, (buf.length / 1e6).toFixed(1) + 'MB');
