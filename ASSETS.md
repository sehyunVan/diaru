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
| `clouds.jpg` | 시작 화면 하늘, 템플릿 둘째 사진 |
| `dusk.jpg` | 홈 오늘 카드, 템플릿 2종 |
| `harbor.jpg` | 프로필 커버, 여행 템플릿 |
| `forest.jpg` | 상점 템플릿 썸네일, 초록빛 주말 |
| `cat.jpg` | 프로필 아바타, 감성 노트 템플릿 |
| `garden.jpg` `lanterns.jpg` `sky.jpg` `street.jpg` | 나머지 템플릿·기본 조각 |

원본(`assets/reference/`, 93MB)과 줄이기 전 스티커 시트(`assets/src/`)는 `.gitignore` 로 뺐다.

## dist/assets/stickers.png — 손그림 팩

image_gen 으로 만든 첫 시트. 프롬프트:

> Create a square 1024x1024 sticker sprite atlas for a tasteful Korean diary decorating mobile app. Exactly 4 columns and 4 rows of equal square cells, no grid lines, pure white background. Each sticker centered in its cell, contained within central 70% of cell, generous blank whitespace margins. Delicate hand drawn thin navy graphite outlines, subtle watercolor in cream, dusty blue, soft pink, sage, muted gold. White die cut edge. No 3D emoji, no text. Row 1: tuxedo cat sitting, white rabbit with pink cheeks, pale gold five point star with little face, pink heart. Row 2: single yellow daisy with green leaves, tiny vintage blue camera, stem of pink tulips, white fluffy kitten. Row 3: iced coffee cup with straw, blue butterfly, crescent moon and tiny stars, green leafy sprig. Row 4: brown teddy bear with ribbon, blue airplane, small white envelope with heart seal, little blue gingham ribbon bow. Cohesive artisanal Korean stationery sticker collection, charming but refined.

## dist/assets/stickers-{pixel,retro,ink,jelly}.png

화풍이 다른 스티커 팩 4종(각 4×4=16개, 배경 투명). 프롬프트는 `tools/gen-stickers.mjs` 안에 있다.
다시 구우려면 `node tools/gen-stickers.mjs [팩이름] [--force]`.
retro·ink·jelly 는 768px 로 줄여 넣었고(원본은 `assets/src/`), 도트는 줄이면 픽셀이 뭉개져 1024 그대로다.
