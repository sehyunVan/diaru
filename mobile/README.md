# 앱 껍데기 — Capacitor

앱은 `../dist-mobile` 을 담는다. 거기에 코드가 없는 이유는 하나다 —
`tools/pack-mobile.mjs` 가 **웹 배포본 `dist/` 를 그대로 복사하고 서버 주소 한 줄만 박기** 때문이다.
웹과 앱이 같은 파일이어야 한 쪽만 고쳐지는 일이 없다.

| | 값 |
|---|---|
| 앱 id (iOS · Android 공통) | `sarl.diaru.app` |
| 앱 이름 | Diaru |
| 화면 | **세로 전용 · 폰 전용** (아이패드 지원 끔) |
| 최소 | iOS 15 · Android 7(API 24) · targetSdk 36 |
| 결제 | 없음 |
| 서버 | `https://diaru.64-227-141-147.sslip.io` ← **빌드에 박힌다** |

제출 순서와 사람이 할 일은 [`../RELEASE.md`](../RELEASE.md).

## 한 바퀴

```bash
npm install                      # 한 번만
npm run sync                     # dist-mobile 을 굽고 cap sync
node ../tools/native-settings.mjs --check   # 박아 둔 설정이 그대로인지
node ../tools/version.mjs        # 버전 네 자리

npm run apk                      # 디버그 APK
npm run release-apk              # 서명본 APK  ← 지문이 걸린 것은 이걸로 시험한다
npm run aab                      # Play 에 올릴 AAB
node ../tools/ios-ready.mjs      # 맥에 들고 가기 전 확인 (iOS 는 윈도우에서 못 굽는다)
```

구운 것은 `android/app/build/outputs/` 에 떨어진다 — `bundle/release/*.aab` 와 `apk/release/*.apk`.
서명은 `android/keystore.properties` 가 있을 때만 붙는다. 없으면 release 가 **서명 없이** 나오고 Play 가 안 받는다.

안드로이드 빌드 전에 두 가지가 필요하다. 둘 다 SHIPPING.md §4 에 적힌 함정이다:

```properties
# android/local.properties — 역슬래시로 쓰면 경로가 뭉개진다. 슬래시로.
sdk.dir=C:/Users/sehyu/AppData/Local/Android/Sdk
```

```bash
# 시스템에 옛 jre1.8 이 있으면 Gradle 이 그걸 집어 죽는다
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" ./gradlew.bat bundleRelease
```

## 눌러서 하지 않는 것

Xcode·Android Studio 에서 누른 설정은 **보이지 않는 상태**라 `cap add` 나 `git pull` 한 번에 날아간다.
그래서 전부 `../tools/native-settings.mjs` 가 파일에 박는다:

| 설정 | 적히는 자리 |
|---|---|
| 세로 고정(iOS) | `ios/App/App/Info.plist` 의 `UISupportedInterfaceOrientations` |
| 아이패드 지원 끔 | `project.pbxproj` 의 `TARGETED_DEVICE_FAMILY = "1"` |
| 사진·카메라 사용 설명 | `Info.plist` 의 `NSPhotoLibraryUsageDescription` 외 둘 — **없으면 사진 고르다 앱이 죽는다** |
| 팀 ID | `project.pbxproj` 의 `DEVELOPMENT_TEAM` (Debug·Release 양쪽) |
| 공유 스킴 | `App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` |
| 세로 고정(안드로이드) | `AndroidManifest.xml` 의 `screenOrientation` |
| 서명 | `android/app/build.gradle` + `android/keystore.properties`(저장소에 없음) |

`cap add` 를 다시 돌렸다면 **그 다음에 반드시** `node ../tools/native-settings.mjs` 를 돌린다.

## 아이콘 · 스플래시

```bash
node ../tools/gen-app-assets.mjs                    # 원본 넉 장 → assets/
npx @capacitor/assets generate \
  --iconBackgroundColor '#f7f1e4' --splashBackgroundColor '#fdfaf4'
```

**아이콘을 새로 그리지 않는다.** 2026-10 에 고른 것(별 없음 · D 크게 · 아이보리)이
`site/appstore/icon-1024x1024.png` 에 있고, 원본은 그걸 쓴다.
`@capacitor/assets` 는 PWA 몫으로 `www/manifest.json` 을 찾으므로, 없으면 빈 파일을 잠깐 두었다 지운다.

## 웹과 다르게 도는 곳 셋

앱이라서 달라지는 자리는 이 셋뿐이다. 웹에서 멀쩡한 것이 앱에서만 죽는 모양이라 찾기 나쁘다.

1. **서버 주소** — 앱 출처는 `capacitor://localhost` 라 `fetch('api/health')` 가 자기 자신을 찌른다.
   → `window.DIARU_API` 를 번들에 박고 `apiURL()` 이 앞에 붙인다.
2. **세션 토큰** — 웹뷰 `localStorage` 는 OS 가 회수한다. → `@capacitor/preferences` 에 같이 적고
   부팅 때 **로그인 게이트보다 먼저** 되살린다. 로그아웃·계정삭제는 네이티브 쪽도 지운다.
3. **이미지로 저장** — `<a download>` 는 웹뷰에서 아무 일도 하지 않는다.
   → 파일로 적고 OS 공유 시트를 연다(`@capacitor/share` + `@capacitor/filesystem`).
