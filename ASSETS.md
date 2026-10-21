# Diaru 그림 자산

## 사진 — 내가 찍은 것

앱 안에 들어가는 사진은 전부 `assets/reference/` 의 내 사진에서 잘라 쓴다.
AI 로 만든 배경(`dist/assets/dusk.png`)은 **버렸다** — 티가 나서 못 쓴다.

```bash
node tools/make-photos.mjs sheet   # 레퍼런스를 번호 붙은 한 장으로 모아 보기
node tools/make-photos.mjs         # PICKS 대로 다시 굽기
node tools/make-photos.mjs cat     # 하나만
```

어떤 사진을 어디에 쓸지는 `tools/make-photos.mjs` 의 `PICKS` 한 곳에만 적혀 있다
(레퍼런스 번호 · 크기 · 초점). 결과는 `dist/assets/photos/*.jpg`.

| 파일 | 쓰이는 곳 |
| --- | --- |
| `clouds.jpg` | 시작 화면 하늘 · @cloudpocket |
| `dusk.jpg` | 홈 오늘 카드 · @slowlantern |
| `harbor.jpg` | 프로필 커버 · @nightharbor |
| `forest.jpg` | @greenweekend · @dotgarden |
| `cat.jpg` | 프로필 아바타 · @pixelcat |
| `garden.jpg` `lanterns.jpg` `sky.jpg` `street.jpg` | 친구들의 기록에 깔리는 사진 |

원본(`assets/reference/`, 93MB)과 줄이기 전 스티커 시트(`assets/src/`)는 `.gitignore` 로 뺐다.

## dist/assets/stickers.png — 손그림 팩

image_gen 으로 만든 첫 시트. 프롬프트:

> Create a square 1024x1024 sticker sprite atlas for a tasteful Korean diary decorating mobile app. Exactly 4 columns and 4 rows of equal square cells, no grid lines, pure white background. Each sticker centered in its cell, contained within central 70% of cell, generous blank whitespace margins. Delicate hand drawn thin navy graphite outlines, subtle watercolor in cream, dusty blue, soft pink, sage, muted gold. White die cut edge. No 3D emoji, no text. Row 1: tuxedo cat sitting, white rabbit with pink cheeks, pale gold five point star with little face, pink heart. Row 2: single yellow daisy with green leaves, tiny vintage blue camera, stem of pink tulips, white fluffy kitten. Row 3: iced coffee cup with straw, blue butterfly, crescent moon and tiny stars, green leafy sprig. Row 4: brown teddy bear with ribbon, blue airplane, small white envelope with heart seal, little blue gingham ribbon bow. Cohesive artisanal Korean stationery sticker collection, charming but refined.

## dist/assets/stickers-{pixel,retro,ink,jelly,foil,press,stamp,clay}.png

화풍이 다른 스티커 팩 8종(각 4×4=16개, 배경 투명). 손그림까지 아홉 화풍 144종. 프롬프트는 `tools/gen-stickers.mjs` 안에 있다.
다시 구우려면 `node tools/gen-stickers.mjs [팩이름] [--force]`.
도트를 뺀 나머지는 768px 로 줄여 넣었다(원본은 `assets/src/`). 도트는 줄이면 픽셀이 뭉개져 1024 그대로다.
새 팩을 더할 때는 시트의 4×4 격자와 셀 경계 알파부터 재고(`moveTo` 없는 별처럼, 눈으로는 안 보인다),
`app.js` 의 `PACKS` 와 `style.css` 의 `.pack-<id>{--sheet:...}` 한 줄씩을 더한다.

## dist/icons — 앱 아이콘

로고와 같은 글꼴(Nanum Pen Script)의 D 와 금색 네 갈래 별. 그림이 아니라 글자라
브라우저에서 글꼴을 불러 캔버스로 굽는다: `node tools/gen-icon.mjs [navy|ivory|star]`.
`_candidates.png` 가 세 안을 나란히 보여주고, 지금 쓰는 건 **ivory**.
마스킹용(안드로이드)은 같은 그림을 74%로 줄여 가장자리가 잘려도 글자가 남게 했다.
별은 바깥 꼭지 넷을 중심(0,0)을 제어점 삼아 이어 그린다 — `moveTo` 를 빠뜨리면 첫 꼭지가 어긋난다.
