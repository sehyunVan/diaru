# 맥에서 iOS 빌드하기

**iOS 빌드는 맥에서만 된다.** Xcode 가 macOS 전용이고, Archive 도 `.ipa` 도 거기서만 나온다.
윈도우에서 하는 일은 「맥에서 열면 Archive 말고 할 일이 없게」 만들어 두는 것까지다
(`node tools/ios-ready.mjs` 가 그게 됐는지 21가지를 본다).

처음 한 번은 §1 을, 그 뒤로는 §2 만 반복한다.

---

## 1. 맥에 처음 앉았을 때

### 필요한 것

| | |
|---|---|
| macOS | Xcode 16 이상이 도는 버전 |
| Xcode | App Store 에서. 처음 열면 추가 구성요소를 받는다(10~20분) |
| Node | 20 이상 — `brew install node` |
| 애플 계정 | Xcode → Settings → Accounts 에 Apple Developer 계정을 더한다 |

```bash
xcode-select --install                 # 명령줄 도구
sudo xcodebuild -license accept
git clone https://github.com/sehyunVan/diaru.git
cd diaru/mobile && npm install         # 5분쯤
```

### Xcode 에 팀 연결

`DEVELOPMENT_TEAM` 은 저장소에 박혀 있다(`FN9DUHVG65`). 그래도 **그 팀에 로그인은 되어 있어야**
프로비저닝 프로파일이 발급된다. Xcode → Settings → Accounts → 계정 추가 → 팀이 보이는지 확인.

팀 ID 가 다르면 윈도우에서 다시 박고 커밋한다:

```bash
APPLE_TEAM_ID=XXXXXXXXXX node tools/native-settings.mjs
```

---

## 2. 낼 때마다 하는 한 바퀴

### ⚠ Xcode 를 **닫은 채로** pull 한다

열어 둔 채 pull 하면 메모리의 옛 값이 `project.pbxproj` 를 되덮는다. 그러면 고쳐 놓은 팀 ID·
버전·권한이 조용히 사라지고, **제출본과 저장소가 다른 물건**이 된다. 찾기 아주 나쁜 사고다.

```bash
cd diaru
git pull
cd mobile && npm install               # package.json 이 바뀌었을 때만 필요하지만 돌려도 손해 없다
npm run sync                           # ← 빼먹으면 옛 웹 번들이 담긴다. 말해 주지 않는다
node ../tools/ios-ready.mjs            # 21가지 확인. ✗ 가 하나라도 있으면 멈춘다
git status mobile/ios                  # 깨끗해야 한다
```

`ios-ready` 가 보는 것(전부 맥에 가서야 알면 하루를 버리는 것들):
팀 ID 가 Debug·Release 양쪽에 있는지 · 폰 전용·세로 고정 · 사진/카메라 사용 설명
(없으면 사진 고르다 그 자리에서 죽는다) · 장면 매니페스트와 SceneDelegate
(없으면 iOS 26/27 이 실행 순간 죽이고 2.1(a) 가 된다) · `Package.swift` 경로가 역슬래시가
아닌지(맥의 SPM 이 못 읽어 플러그인을 통째로 안 싣는다) · 웹 번들과 서버 주소 · 두 스토어 버전 일치.

### 열고, 폰에서 한 번 돌려 보고

```bash
open mobile/ios/App/App.xcodeproj
```

1. 폰을 USB 로 꽂는다(처음이면 폰에서 「이 컴퓨터를 신뢰」).
2. **상단 대상 드롭다운에서 폰 이름을 직접 고른다.**
   - `Any iOS Device (arm64)` 로 두면 **Run 이 영구히 회색**이다. 오류도 창도 안 뜬다.
   - 폰이 `Unavailable` 이면 보통 iOS 가 Xcode 보다 새것이다. ⇧⌘2 가 이유를 글로 말해 준다.
3. **⌘R** 로 실행한다. ⌘B(Build)는 **컴파일만** 한다 — 성공 문구만 보고 폰엔 아무것도 안 깔린다.
4. 홈 화면에 아이콘이 없으면 의심하기 전에 **검색부터**(홈에서 아래로 쓸기 → Diaru).
   iOS 설정 → 홈 화면 및 앱 보관함 → 「앱 보관함에만」이면 홈에 아이콘이 안 생긴다.

폰에서 한 바퀴 돌려 본다 — 심사자는 네가 생각한 길을 안 쓴다:
시작하기로 **계정 없이** 들어가기 → 꾸미고 저장 → 마이에서 로그인 → 친구 신청 → 신고 → 계정 삭제.

### Archive 해서 올린다

```
Product > Scheme > App 인지 확인
상단 대상 드롭다운을 Any iOS Device (arm64) 로 바꾼다   ← Archive 는 이게 맞다
Product > Archive
Organizer 가 뜨면 Distribute App > App Store Connect > Upload
```

올린 뒤 App Store Connect 에서 그 빌드를 버전에 붙이고 제출한다.
처리(processing)에 10~30분 걸린다.

---

## 3. 버전 — 이번에 걸릴 자리

애플이 심사한 것은 **`1.0 (26102206)`** 이었다. 빌드 번호는 우리 도구가 찍은 값과 맞는데
**버전 이름이 `1.0`** 이다(우리 도구는 날짜를 붙여 `1.0.1022` 를 찍는다).

ASC 의 「버전」 레코드와 빌드의 `CFBundleShortVersionString` 이 **같아야** 그 버전에 빌드가 붙는다.
ASC 에 `1.0` 이 있는데 빌드가 `1.0.1102` 로 올라가면 **그 버전 아래 안 보인다.**

그래서 이번 재제출은 **이름을 `1.0` 으로 고정**해 뒀다:

```bash
node tools/version.mjs --name 1.0      # 이름은 1.0, 빌드 번호만 오른다
node tools/version.mjs --show
```

지금 값: **Version `1.0` · Build `26110202`** (안드로이드도 같은 값).

- 반려를 받고 다시 낼 때는 **Version 은 그대로, Build 만 올린다.** 같은 빌드 번호는 두 번 안 받는다.
- 승인되어 출시된 뒤에는 `1.0` 이 닫힌다(`train version "1.0" is closed`). 그때는
  `node tools/version.mjs` 를 그냥 돌려 `1.0.MMDD` 를 쓰고, **ASC 에도 그 번호로 버전을 새로 만든다**
  (ASC → 앱 → 왼쪽 「+ 버전 또는 플랫폼」).

### 맥의 pbxproj 가 저장소 것이 맞는지

위 이름 차이는 **맥의 `project.pbxproj` 가 저장소 것이 아니라는 신호**일 수도 있다(SHIPPING.md §4).
그렇다면 팀 ID·세로 고정·권한 설명도 제출본에 안 들어갔을 수 있다. pull 한 뒤 확인한다:

```bash
grep -E "MARKETING_VERSION|CURRENT_PROJECT_VERSION|DEVELOPMENT_TEAM" \
  mobile/ios/App/App.xcodeproj/project.pbxproj
git status mobile/ios            # 깨끗해야 한다
```

제출한 뒤 「정말 무엇이 들어갔나」를 보려면 저장소가 아니라 아카이브를 연다:

```
Xcode > Organizer > Archives > 우클릭 Show in Finder
codesign -d --entitlements :- /경로/App.app
```

---

## 4. 이번 제출에서 같이 할 일

1. **반려 답글** — `STORE.md` §6 에 원고가 있다. `<새 빌드 번호>` 자리에 `26110202` 를 넣는다.
2. **심사용 계정** — 기본값(`root@diaru.app` / `000000`)은 뒷문이다. 제출 직전에 무작위로 바꾸고
   승인 뒤 닫는다. 절차는 `RELEASE.md` §6.
3. 5.1.1(v) 로 반려됐으므로 **계정 없이 들어가지는 것**을 녹화에 꼭 담는다 — 그게 고친 증거다.

---

## 막히면 보는 곳

| 증상 | 어디 |
|---|---|
| Run 이 회색 | §2 의 대상 드롭다운 |
| 실행 즉시 죽는다 | SceneDelegate — `ios-ready` 가 본다 |
| 로그인이 그냥 안 된다 | `Package.swift` 역슬래시 — `ios-ready` 가 본다 |
| 빌드만 「팀이 없다」 | `DEVELOPMENT_TEAM` 이 Debug·Release 양쪽에 있는지 |
| 고쳤는데 그대로다 | `npm run sync` 를 빼먹었다 |
| 그 밖에 | 저장소 루트의 [`SHIPPING.md`](../../SHIPPING.md) §4 — 실제로 밟은 것들만 있다 |
