# Diaru — 스토어 원고와 심사 답변

제출 순서와 사람이 할 일은 [`RELEASE.md`](RELEASE.md), 올릴 그림은 [`site/`](site/README.md) 에 있다.
여기 있는 것은 **콘솔 칸에 그대로 옮겨 붙일 글**이다.

---

## 1. 스토어 등록 정보

| 칸 | 값 |
|---|---|
| 이름 | **Diaru** |
| 부제(App Store, 30자) | 오늘의 조각을 붙여 두는 곳 |
| 간단한 설명(Play, 80자) | 사진·글·스티커를 펼침면에 놓고 꾸미는 다이어리. 친구에게만 열립니다. |
| 카테고리 | 라이프스타일 (두 번째: 사진/비디오) |
| 가격 | 무료 · 인앱 상품 없음 |
| 지원 언어 | 한국어 |
| 연령 등급 | 아래 §3 |

### 설명 (App Store 설명 · Play 자세한 설명 공용)

```
종이 다이어리를 꾸미던 감각을 폰에 옮겼습니다.

좌우로 펼쳐지는 종이 위에 사진과 글, 스티커를 원하는 자리에 놓습니다.
틀도, 견본도 없습니다. 빈 종이와 도구만 있습니다.

· 속지 열두 무늬 — 무지·줄글·땡땡이·모눈·월간/주간 플래너·체크리스트·공책·오선지·사선·삼각 격자
· 스티커 아홉 화풍 144종 — 손그림·도트·레트로·먹선·젤리·금박·압화·도장·펠트
· 내 사진도 스티커로 — 올리면 배경을 살린 채 스티커가 됩니다
· 손글씨 — 펜을 켜면 종이가 받아 적습니다. 필압까지
· 자동 배치 — 사진을 여러 장 고르면 알아서 자리를 잡습니다. 다시 고르면 다르게 놓입니다
· 두 손가락으로 확대 — 작은 것도 제자리에
· 이미지로 저장 — 펼침면을 그대로 2배 크기 그림으로

비공개가 기본입니다.
프로필은 잠겨 있고, 서로 수락한 친구에게만 열립니다.
기록은 그 위에 한 겹 더 — 한 장씩 「나만 보기」와 「친구 공개」를 고릅니다.
기본값은 나만 보기입니다.

친구가 공개한 기록에는 마음을 찍고 한 마디를 남길 수 있습니다.

광고가 없습니다. 추적하지 않습니다. 매일 들어오라고 조르지 않습니다.
```

### 홍보 텍스트 (App Store, 170자 — 심사 없이 바꿀 수 있다)

```
속지를 갈아 끼우고, 스티커를 붙이고, 손으로 한 줄 적습니다.
사진은 던져 두면 알아서 앉습니다. 다 꾸민 펼침면은 그림 한 장으로 나갑니다.
```

### 키워드 (App Store, 100자 · 쉼표로)

```
다이어리,꾸미기,스티커,속지,일기,저널,스크랩북,사진꾸미기,손글씨,플래너,기록,꾸미기앱
```

### 새로운 기능 (1.0)

```
처음 내놓습니다.
```

---

## 2. 앱 개인정보 (Apple) · 데이터 안전성 (Play)

**추적(Tracking)은 전부 「아니요」.** 광고 식별자도 분석 SDK 도 넣지 않았다.

| 데이터 | 받나 | 용도 | 계정에 연결되나 |
|---|---|---|---|
| 이메일 주소 | ○ | 앱 기능(로그인) | 예 |
| 이름·사용자 ID(@아이디) | ○ | 앱 기능 | 예 |
| 사진·동영상 | ○ | 앱 기능(다이어리에 넣은 사진) | 예 |
| 기타 사용자 콘텐츠 | ○ | 앱 기능(글·손글씨·스티커 배치·댓글) | 예 |
| 연락처·위치·건강·금융·검색 기록·광고 데이터 | ✕ | — | — |

Play 데이터 안전성 설문 답:

- 수집하는 데이터 — **있음**: 개인 정보(이름·이메일 주소·사용자 ID), 사진 및 동영상, 앱 활동(기타 사용자 생성 콘텐츠)
- 제3자와 **공유하지 않음** (로그인 메일 발송을 위한 Resend 는 우리 대신 처리하는 서비스 제공업체)
- 전송 중 **암호화됨** (HTTPS)
- 사용자가 **데이터 삭제를 요청할 수 있음** — 앱 안에서 직접(마이 → 프로필 편집 → 계정 삭제)
- 삭제 요청 URL: `https://diaru.64-227-141-147.sslip.io/legal/support.html`

---

## 3. 연령 등급

사용자가 올린 내용이 **서로 수락한 친구에게만** 보이고, 신고와 차단이 둘 다 있다.

- **App Store**: 12+ 로 신청한다. 설문에서 「사용자 생성 콘텐츠」와 「제한 없는 웹 접근」은
  각각 *있음 / 없음*. 사용자끼리 메시지를 주고받는 기능은 **없다**(남의 기록에 댓글만).
- **Play(IARC)**: 폭력·성적 내용·도박·약물 전부 「없음」. 「사용자 상호작용」 **있음**,
  「사용자 간 콘텐츠 공유」 **있음**, 위치 공유 **없음**, 개인정보 공유 **없음**.

---

## 4. 앱 액세스 · 심사용 계정

로그인이 **이메일 여섯 자리 코드 하나뿐**이라 심사자가 메일함에 들어갈 수 없다.
그래서 서버에 고정 계정을 잠깐 열고 그 값을 적어 준다 — 자세한 절차는 [`RELEASE.md`](RELEASE.md) §6.

App Review Information / Play 「앱 액세스」에 적을 내용:

```
Sign-in is a six-digit code sent by email; there is no password.
For review we have enabled a fixed account that accepts a fixed code.

  Email: <DEMO_EMAIL>
  Code:  <DEMO_CODE>

Enter the email on the first screen, tap send, then enter the code above.
The account is already set up, so you land on the home screen.
This account is disabled once the app is approved.
```

---

## 5. 심사 답변 — Guideline 2.1 Information Needed

신규 개발자 계정의 첫 앱에는 **거의 반드시 온다.** 반려가 아니다 — 편지 첫 문장이
「submitted by a developer account that has a limited App Review history」라고 말한다.
빌드를 다시 올릴 일이 아니다. 심사 메시지에 **답글**로 아래를 붙이고,
**같은 내용을 App Review Information 의 Notes 칸에도** 넣는다(4000자 제한이라 이미 줄여 뒀다).

심사자는 한국어를 안 읽으므로 그대로 붙인다. `<...>` 만 채운다.

```
1. SCREEN RECORDING
Attached; iPhone, latest iOS, from launch.
0:00 Launch - start screen, tap Start
0:08 Sign in: enter email, receive six-digit code, enter it (account creation)
0:25 Choose a handle (@id), optional display name, seal and header
0:45 Home; tap New diary
0:55 Place photos (auto-layout), add text, add stickers, swap the paper pattern
1:40 Pen: handwriting on the page
1:55 Set this entry to "Friends only" and save
2:10 Friends: search a handle, send a request; the other side must accept
2:35 Open a friend's entry, tap the heart, leave a comment
2:55 Tap the "..." next to a person / entry / comment: Report and Block
3:15 Download icon: export the spread as an image
3:30 Profile > Edit profile > Delete account

2. PURPOSE AND AUDIENCE
Diaru is a diary-decorating app. A two-page paper spread opens and you place
photos, text, stickers and handwriting anywhere on it. There are no templates:
twelve paper patterns, 144 stickers in nine drawn styles, and tools.
It is not a task manager and has no streaks, no scores and no notifications.
Audience: adults and teens who used to decorate paper diaries.
Everything is private by default; a profile opens only to mutually accepted
friends, and each entry is additionally marked "Only me" (default) or
"Friends only".

3. SETUP AND ACCESS
Sign-in is a six-digit code sent by email; there is no password and no
third-party login. For review a fixed account is enabled:
  Email: <DEMO_EMAIL>   Code: <DEMO_CODE>
Enter the email on the first screen, tap send, enter the code. The account is
already set up, so you land on the home screen. A new account starts empty -
no sample entries and no sample friends, by design.
"Delete account" is in Profile > Edit profile and erases the handle, profile,
entries, sessions and friend links in-app; it cannot be undone.
There is no paid content of any kind.

4. EXTERNAL SERVICES
Our own server at https://diaru.64-227-141-147.sslip.io - accounts, entries,
friends, hearts, comments and reports. Resend - sends the sign-in code email,
and nothing else. Google Fonts - four web fonts.
No AI service, no analytics or attribution SDK, no ad network, no third-party
data broker, and no tracking of any kind.

5. REGIONAL DIFFERENCES
None. The app behaves identically everywhere and ships in Korean only.

6. USER-GENERATED CONTENT AND MODERATION
Entries, display names, bios and comments are written by users. Content is not
public: an entry is visible only to users the author has accepted as friends and
only when the author marks that entry "Friends only".
Controls, all reachable from the "..." button next to a person, an entry or a
comment:
  - Report, with a reason (spam, harassment, sexual content, copying, other).
    Reports reach our server and are reviewed; objectionable content is removed
    and the account suspended within 24 hours.
  - Block, which immediately hides both sides from each other and drops any
    friend link and pending request.
  - The author can delete any comment on their own entry, and any entry.
Contact for reports and takedowns: support@copycat.sarl
Terms and policy: https://diaru.64-227-141-147.sslip.io/legal/privacy.html
Support: https://diaru.64-227-141-147.sslip.io/legal/support.html

7. IN-APP PURCHASE
None. The app is free, contains no in-app purchases or subscriptions, shows no
ads, and has no paid tier. All twelve papers and all 144 stickers are included.
```

---

## 6. 다시 물어올 만한 것

미리 답을 정해 두면 한 라운드를 줄인다.

- **4.8 Login Services** — 해당 없다. 제3자 로그인이 **하나도 없고** 우리 계정 체계만 쓰므로
  면제 조항에 걸린다. 나중에 구글·애플 로그인을 붙이면 **그때 Sign in with Apple 도 같이** 넣어야 한다
  (나중에 넣으면 빌드를 다시 낸다 — SHIPPING.md §1).
- **1.2 User-Generated Content** — 위 6번이 답이다. 신고·차단·삭제·연락처가 전부 있다.
  **신고가 쌓이는 `reports.jsonl` 을 읽는 사람이 실제로 있어야 한다** — 24시간은 우리가 적은 약속이다.
- **5.1.1 데이터 수집** — 이메일 말고는 받는 것이 없고, 계정 삭제가 앱 안에 있다.
- **2.3.3 스크린샷** — 1·2번이 실제 꾸미는 화면이다. 시작 화면은 묶음에 넣지 않았다.
