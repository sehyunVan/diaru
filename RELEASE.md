# Diaru 출시 — 하는 순서

먼저 읽을 것: 저장소 루트의 [`SHIPPING.md`](../SHIPPING.md). 두 스토어에서 **실제로 반려된** 것들이 거기 있다.
**제출 전에 한 번, 반려를 받으면 다시 한 번** 읽는다. 이 문서는 그 위에 Diaru 의 실제 값만 얹은 것이다.

스토어에 올릴 그림은 [`site/`](site/README.md), 원고와 심사 답변은 [`STORE.md`](STORE.md) 에 있다.

## 정해 둔 값

| | 값 |
|---|---|
| iOS 번들 · Android 패키지 | `sarl.diaru.app` (둘이 같다) |
| 앱 이름 | Diaru |
| Apple Team ID | `FN9DUHVG65` ← **확인할 것.** copycat 것을 그대로 썼다 |
| 화면 | **세로 전용 · 폰 전용** (아이패드 지원 끔 · Play 태블릿 묶음 안 올림) |
| 최소 | iOS 15 · Android 7(API 24) · targetSdk 36 |
| 서버 | `https://diaru.64-227-141-147.sslip.io` |
| 개인정보처리방침 | `…/legal/privacy.html` |
| 지원 | `…/legal/support.html` |
| **계정 삭제** | `…/legal/delete.html` ← Play 가 **앱 없이 열리는 주소**로 따로 요구한다 |
| 로그인 | 이메일 여섯 자리 코드 **하나뿐** |
| 결제 | **없다.** 무료 앱, 인앱 상품 없음 |
| 버전 | `1.0.MMDD` / `YYMMDDnn` — `node tools/version.mjs` 가 네 자리에 한 번에 찍는다 |

### ⚠ 서버 주소가 앱에 박힌다

`tools/pack-mobile.mjs` 가 `window.DIARU_API` 를 번들에 박는다. 앱 안에서는 출처가
`capacitor://localhost` 라 상대경로가 우리 서버에 닿지 않기 때문이다.
**그래서 이 주소가 바뀌면 앱을 다시 내야 한다.** sslip.io 는 IP 가 주소의 일부라,
박스를 옮기면 깔린 앱이 전부 죽는다(2026-10-20 에 박스를 한 번 잃었다).
지금은 그대로 가기로 했지만, 1.0 이 나간 뒤 **도메인을 사서 옮기는 것이 첫 번째 할 일**이다.

## 한 바퀴

```bash
node server/test.mjs                 # 서버 83개 검사
node tools/pack-mobile.mjs           # dist/ → dist-mobile/ (서버 주소를 박는다)
cd mobile && npm run sync            # 굽고 cap sync
node ../tools/native-settings.mjs --check   # 파일에 박아 둔 설정이 그대로인지
node ../tools/version.mjs            # 버전 네 자리

npm run apk                          # 디버그 APK (폰에 꽂아 보기)
npm run release-apk                  # 서명본 APK — **구글 로그인/지문 시험은 이걸로**
npm run aab                          # Play 에 올릴 AAB
node ../tools/ios-ready.mjs          # 맥에 들고 가기 전 21가지 확인
```

**iOS 는 윈도우에서 못 굽는다.** Xcode 가 macOS 전용이라 Archive·.ipa 는 맥에서만 나온다.
여기서 할 수 있는 것은 「맥에서 열면 Archive 말고 할 일이 없게」 만들어 두는 것까지고,
그게 됐는지는 `tools/ios-ready.mjs` 가 본다(팀 ID·세로 고정·권한 설명·장면·SPM 경로·번들·버전).

### 2026-10-22 에 구운 것

| | |
|---|---|
| AAB (Play) | `build/diaru-1.0.1022-26102202.aab` · 16.3MB |
| APK (서명본, 폰에 직접) | `build/diaru-1.0.1022-26102202.apk` · 16.8MB |
| 서명 | `C:/Users/sehyu/keys/diaru-upload.jks` · SHA-1 `3A:DF:C3:F6:37:E5:B9:43:CC:C7:84:25:6B:02:74:CB:C7:1A:06:B5` |
| iOS | 프로젝트만 — 맥에서 Archive |

`build/` 는 저장소에 안 들어간다. 다시 구우면 같은 것이 나온다.

**업로드 키를 잃으면 같은 앱을 업데이트할 수 없다.** 비밀번호는
`mobile/android/keystore.properties` 에 있고, 설명은 `C:/Users/sehyu/keys/README-diaru.txt` 에 있다.
둘 다 **이 컴퓨터 밖에 한 벌** 둬라.

## 사람이 해야 하는 것 — 코드로 못 한다

제출을 막는 것부터 위에 둔다.

1. **`support@copycat.sarl` 로 오는 편지를 진짜 받을 수 있게 한다.** 개인정보처리방침과 지원 페이지에
   그 주소가 적혀 있다. 애플은 **연락처가 닿는지**를 본다. 다른 주소를 쓸 거면 두 HTML 과 `STORE.md` 를 같이 고친다.
2. **Apple Team ID 확인.** 지금 `FN9DUHVG65` (copycat 것)가 박혀 있다. 다르면
   `APPLE_TEAM_ID=… node tools/native-settings.mjs` 로 다시 박는다.
3. **유료 앱 계약 · 세금 · 은행** — 결제가 없어도 계정 상태는 봐야 한다. 제일 오래 걸린다.
4. **Play 개인 계정이면 비공개 테스트 12명 × 14일 연속.** 사람을 모으는 동안 시계가 흐르므로
   **지금 시작한다.** 12명이 아니라 14~15명을 모은다(한 명 빠지면 시계가 리셋된다).
5. **업로드 키스토어를 만들고 `mobile/android/keystore.properties` 를 쓴다.** 저장소에 안 들어간다
   (`.gitignore` 가 **이름으로** 막는다 — `git check-ignore -v` 로 확인했다).

   ```properties
   storeFile=C:/Users/sehyu/keys/diaru-upload.jks
   storePassword=…
   keyAlias=upload
   keyPassword=…
   ```
6. **심사용 계정을 연다.** 로그인이 메일 코드뿐이라 심사자가 메일함에 못 들어간다 →
   서버에 고정 계정을 **잠깐** 연다. 기본값(`root@diaru.app` / `000000`)은 **절대 쓰지 않는다** —
   그건 그냥 뒷문이다. 무작위로 만든다:

   ```bash
   # 값은 매번 새로 만든다 — 아래는 모양을 보이려고 적은 예시다
   node -e "console.log('DEMO_EMAIL=review-'+require('crypto').randomBytes(3).toString('hex')+'@diaru.app');
            console.log('DEMO_CODE='+String(require('crypto').randomInt(1e6)).padStart(6,'0'));
            console.log('DEMO_HANDLE=review_'+require('crypto').randomBytes(2).toString('hex'))"
   ```

   `/etc/diaru.env` 에 넣고 `systemctl restart diaru`. **승인이 나면 지우고 다시 restart.**
   이 값을 App Review Information 의 계정 칸과 Play 의 「앱 액세스」에 적는다.
7. **녹화 + 7항목 답변을 미리 써 둔다.** 신규 개발자 계정이면 2.1(Information Needed)은 거의 반드시 온다.
   원고는 [`STORE.md`](STORE.md) 의 「심사 답변」에 이미 써 뒀다 — 녹화만 하면 된다.
   실기기 · 최신 OS · **앱 실행 화면부터**, 계정 생성 → 로그인 → **삭제**, 사용자 생성 콘텐츠와
   **신고·차단**까지 한 번에 담는다.
8. **연령 등급 · 데이터 안전성 설문** — 답은 [`STORE.md`](STORE.md) 에 적어 뒀다. 콘솔에 옮기기만 하면 된다.
9. **실기기에서 한 바퀴.** 심사자는 네가 생각한 길을 안 쓴다. 띄워 둔 수단은 전부 한 번씩 눌러 본다.

## 이번에 코드로 막은 구멍 셋

출시 준비를 하면서 **앱이 폰에서 아예 안 돌거나 반려될** 것을 셋 찾아 고쳤다. 다시 깨뜨리지 않도록 적어 둔다.

- **상대경로 API** — `fetch('api/health')` 는 웹에서만 맞다. 앱 출처는 `capacitor://localhost` 라
  우리 서버가 아니라 자기 자신을 찌른다. → `window.DIARU_API` + `apiURL()`. **웹 배포본은 그대로다.**
- **신고 수단 없음** — 차단만 있었다. 차단은 *내 눈에서 가리는 일*이고 신고는 *우리에게 알리는 일*이라
  App Store 1.2 는 둘 다 요구한다. → `POST /api/report` + 사람·기록·댓글의 `⋯` 에 붙은 시트.
  신고는 `reports.jsonl` 에 한 줄씩 쌓인다(`/var/lib/diaru/reports.jsonl`). **읽는 사람이 있어야 한다.**
- **토큰이 `localStorage` 에만** — 웹뷰 저장소는 OS 가 회수한다. 2026-10-18 에 다른 앱에서
  「기기 둘에서 로그인이 풀렸다」가 이것이었다. → `@capacitor/preferences` 에 같이 적고,
  부팅 때 **로그인 게이트보다 먼저** 되살린다. 로그아웃·계정삭제는 네이티브 쪽도 지운다.

### 폰에 깔아 보고 나서 찾은 것 둘 (2026-10-22)

실기기에 깔기 전에는 **둘 다 안 보였다.** 헤드리스로 아무리 돌려도 안 나온다 —
「빌드가 된다」는 깔아 봤다는 뜻이 아니다.

- **서버가 CORS 헤더를 안 보내고 있었다**(`ORIGIN=off`). 웹에서는 앱과 서버가 같은 출처라
  필요가 없었는데, **앱 안의 출처는 `https://localhost`**(안드로이드) · `capacitor://localhost`(iOS)라
  서버로 가는 모든 요청이 교차 출처다. 허락 헤더가 없으면 브라우저가 응답을 버리고,
  앱은 그걸 「서버가 없다」로 읽어 이메일 로그인을 건너뛰고 **아이디 단계부터** 띄웠다.
  한 번 그렇게 들어가면 `me.onboarded` 가 서 버려서 **이메일 단계가 다시는 안 뜬다.**
  → 서버가 출처 목록을 받게 고쳤다(`ORIGIN=*` — 토큰 없이는 아무것도 못 읽으니 위험하지 않다).
    앱 쪽도 고쳤다: 서버에 못 닿으면 **기기에만 사는 계정을 만들지 않고** 같은 칸에 이유를 적는다.
    이미 갇힌 기기는 다음 실행에 서버가 보이면 스스로 풀린다.
- **CSS 폭이 600 을 넘으면 「책상 위의 폰」 데스크톱 레이아웃으로 떨어진다.** 390px 액자가
  가운데 떠서 화면을 다 못 채운다. 웹뷰가 보고하는 CSS 폭은 기기·표시 크기 설정마다 다르다.
  → `dist/native.css` 를 **앱 번들에만** 링크해 언제나 꽉 찬 폰으로 고정했다.
    `100vw` 대신 `100%` 를 쓴다(웹뷰가 말하는 100vw 가 보이는 폭과 다를 때가 있고, 그 차이가 좌우로 밀린다).
    상태바 밑으로 들어가던 헤더에 `env(safe-area-inset-top)` 을 넣었다 — 아래쪽은 이미 쓰고 있었다.

둘 다 검사로 덮었다: 서버 검사에 CORS 넷(앱 출처·사전 요청·Authorization·DELETE),
레이아웃은 360/390/412/320 과 480/600/720 폭에서 `.app` 이 화면을 꽉 채우는지 잰다.

그리고 하나 더 — **`<a download>` 는 웹뷰에서 아무 일도 하지 않는다.** 「이미지로 저장」이 앱에서만
조용히 죽는 모양이라 찾기 나쁘다. → 네이티브면 파일로 적고 OS 공유 시트를 연다(`@capacitor/share`).

## 올리기 직전 점검

- [ ] `node server/test.mjs` 83개 통과
- [ ] `node tools/native-settings.mjs --check` 가 조용하다
- [ ] `node tools/version.mjs --show` 가 네 자리 모두 같은 값
- [ ] `git status mobile/ios` 가 깨끗하다 ← 맥의 Xcode 가 고친 것이 커밋 안 되면 **제출본과 저장소가 다른 물건**이다
- [ ] 서버의 `DEMO_EMAIL` 이 **무작위 값**이다(기본값 아님)
- [ ] 개인정보처리방침·지원·**계정 삭제** URL 이 셋 다 **열린다**(브라우저로 직접)
- [ ] 계정 삭제 페이지가 **진짜로 지운다** — 버릴 계정 하나로 한 바퀴 돌려 본다
- [ ] 스크린샷이 **실제 쓰는 화면**이다 — 시작 화면·로그인만 있으면 2.3.3
- [ ] 실기기에서 계정 생성 → 기록 작성 → 친구 신청 → 신고 → **계정 삭제** 까지 한 바퀴

## 승인 뒤 바로

- [ ] 서버의 `DEMO_EMAIL`·`DEMO_CODE`·`DEV` 를 **비우고 restart** — 심사용 뒷문을 닫는다
- [ ] Play Console → 앱 서명 → **앱 서명 키 인증서의 SHA-1** 을 받아 둔다(나중에 로그인 붙일 때 필요하다)
- [ ] 도메인을 사서 서버 주소를 옮긴다(위 ⚠)
