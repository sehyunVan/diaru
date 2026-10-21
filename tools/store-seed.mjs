/* 스크린샷용 저장본 — 한참 써 본 사람의 기기.
   앱은 가입하면 **비어 있다**(견본 기록을 두지 않는 것이 이 앱의 규칙이다).
   그래서 스토어 그림을 찍을 때만 이 저장본을 localStorage 에 심는다. 앱 코드는 건드리지 않는다.

   좌표계는 펼침면 1200×1000 이다. 접힘이 x=600 이라 580~620 에는 아무것도 두지 않는다.
   사진 조각은 폴라로이드처럼 테두리가 있어(padding 8/8/23) 안쪽 그림은 w-16 × h-31 이다. */

const P = n => 'assets/photos/' + n + '.jpg';

/* 사진 한 장 — x,y 는 왼쪽 위, w,h 는 테두리까지 */
const photo = (name, x, y, w, h, rotation = 0) => ({ type: 'photo', content: P(name), x, y, w, h, rotation });
/* 스티커 — 85×85 고정(앱의 .piece.sticker 와 같다) */
const sticker = (pack, sprite, x, y, rotation = 0) => ({ type: 'sticker', pack, sprite, content: '스티커', x, y, w: 85, h: 85, rotation });
/* 글 — font 는 gaegu(개구 손글씨) · nanum(나눔 펜) · sans · serif */
const text = (content, x, y, w, h, { rotation = 0, font = 'gaegu', bold = false, italic = false } = {}) =>
  ({ type: 'text', content, x, y, w, h, rotation, font, bold, italic });

export const DIARIES = [
  {
    id: 'shot-walk', title: '바람이 좋아서 멀리 걸었다', date: '2026.10.19', subtitle: '여행',
    paper: 'dot', background: '#fffdf7', shared: true, layout: 'spread', image: null,
    items: [
      photo('forest', 56, 96, 380, 340, -3),
      sticker('press', 15, 432, 118, 12),
      text('10월 19일 (일)\n숲 쪽으로 한 시간', 92, 468, 320, 132, { rotation: -2 }),
      sticker('hand', 11, 58, 648, -9),
      photo('garden', 152, 606, 330, 300, 4),
      photo('sky', 698, 86, 390, 344, 3),
      text('하늘이 유난히 높았다.\n사진으로는 반도 안 담긴다.', 664, 458, 470, 132, { rotation: -1 }),
      sticker('foil', 4, 1078, 416, 14),
      sticker('clay', 13, 660, 624, -7),
      photo('street', 818, 596, 322, 300, -4),
      text('또 오자 ♡', 656, 836, 200, 56, { rotation: -3, font: 'nanum' }),
    ],
  },
  {
    id: 'shot-harbor', title: '밤의 항구', date: '2026.10.15', subtitle: '일상',
    paper: 'ruled', background: '#edf2f9', shared: false, layout: 'spread', image: null,
    items: [
      photo('harbor', 62, 118, 400, 360, -2.5),
      sticker('ink', 12, 452, 92, 10),
      text('불빛만 남은 시간', 96, 506, 280, 50, { rotation: -1 }),
      sticker('foil', 13, 58, 636, -6),
      photo('lanterns', 148, 588, 340, 312, 3.5),
      photo('clouds', 690, 126, 390, 344, 2.5),
      text('집에 가는 길,\n괜히 멀리 돌아서 왔다.', 668, 500, 450, 132, { rotation: -1.5 }),
      sticker('stamp', 14, 1082, 438, 9),
      sticker('press', 5, 662, 640, -8),
      photo('dusk', 764, 612, 326, 298, -3),
      text('2026 · 가을', 660, 862, 220, 50, { rotation: 2, font: 'nanum' }),
    ],
  },
  {
    id: 'shot-coffee', title: '오늘의 커피', date: '2026.10.12', subtitle: '취향',
    paper: 'grid', background: '#f6f3ea', shared: true, layout: 'spread', image: null,
    items: [
      photo('dusk', 66, 132, 380, 342, 3),
      sticker('retro', 10, 444, 116, -10),
      text('해 지는 쪽 자리', 100, 506, 260, 50, { rotation: -2 }),
      sticker('jelly', 8, 58, 626, 7),
      photo('cat', 142, 592, 330, 306, -3.5),
      text('오래 앉아 있었다', 700, 110, 300, 50, { rotation: -1.5, font: 'nanum' }),
      photo('garden', 686, 182, 380, 342, -2),
      sticker('clay', 8, 1074, 148, 12),
      sticker('hand', 8, 656, 556, -6),
      text('한 잔 더 시킬까\n고민하다가 그만뒀다.', 768, 546, 410, 132, { rotation: 1 }),
      photo('street', 846, 672, 306, 286, 3.5),
    ],
  },
];

/* 앱이 읽는 그대로의 localStorage. 계정 id 가 없으면 기록은 diaru-diaries-v1 에 산다. */
export const SEED = {
  'diaru-me': {
    handle: 'haru_note', bio: '오늘의 조각을 모으는 중', onboarded: true,
    /* 배경은 앱이 가진 사진 이름, 인장은 스티커 한 장 — 둘 다 앱이 그대로 받는 값이다 */
    cover: 'harbor', seal: { pack: 'hand', sprite: 0 },
  },
  'diaru-diaries-v1': DIARIES,
  'diaru-activity': [],
};

/* 이름은 따로 산다(평문) */
export const PLAIN = { 'diaru-profile-name': '하루' };
