/* ============================================================
   native-settings.mjs — Xcode·Android Studio 에서 「눌러서」 하던 설정을 파일에 박는다.

     node tools/native-settings.mjs          # 적용
     node tools/native-settings.mjs --check  # 어긋난 것만 알려 준다(고치지 않음)

   왜 도구로 하나 — SHIPPING.md §4 의 규칙이다. 눌러서 한 설정은 **보이지 않는 상태**라
   ① 저장소에 안 남고 ② `cap add` 로 프로젝트를 다시 만들면 날아가고 ③ `git pull` 이 지운다.
   실제로 두 앱에서 당했다: 화면에는 팀이 보이는데 빌드만 「팀이 없다」고 한다.

   박는 것:
     iOS   세로 고정 · 아이패드 지원 끔 · 사진/카메라 사용 설명 · 팀 ID(Debug·Release 양쪽) · 공유 스킴
     안드로이드  세로 고정 · 서명 설정(keystore.properties 를 읽는다)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const M = path.join(ROOT, 'mobile');
const CHECK = process.argv.includes('--check');
/* 팀 ID 는 Apple Developer 의 Membership 에 있다. 이 값이 비면 Archive 가 「팀이 없다」로 죽는다. */
const TEAM = process.env.APPLE_TEAM_ID || 'FN9DUHVG65';

let changed = 0, problems = [];
const note = (ok, what) => { console.log((ok ? '  ✓ ' : '  ✗ ') + what); if (!ok) problems.push(what); };

function edit(file, fn, label) {
  if (!fs.existsSync(file)) { note(false, label + ' — 파일이 없다(`npx cap add` 를 먼저)'); return; }
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before);
  if (after === before) { note(true, label + ' (이미 맞음)'); return; }
  if (CHECK) { note(false, label + ' — 어긋나 있다'); return; }
  fs.writeFileSync(file, after);
  changed++;
  note(true, label);
}

/* ── iOS ─────────────────────────────────────────────── */
const PLIST = path.join(M, 'ios/App/App/Info.plist');
edit(PLIST, s => {
  /* 세로 전용 — 폰 전용으로 내기로 했다(site/README.md 「태블릿은 올릴지부터 정한다」) */
  s = s.replace(
    /(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/,
    '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
  /* 아이패드용 방향 목록은 통째로 뺀다 — 아이패드를 지원하지 않는다 */
  s = s.replace(/\s*<key>UISupportedInterfaceOrientations~ipad<\/key>\s*<array>[\s\S]*?<\/array>/, '');
  /* 사진첩·카메라 — <input type="file"> 이 여는 시트가 카메라를 포함한다.
     설명이 없으면 그 자리에서 앱이 죽는다. */
  const needs = {
    NSPhotoLibraryUsageDescription: '다이어리에 넣을 사진을 고르기 위해 사진첩을 엽니다.',
    NSCameraUsageDescription: '다이어리에 넣을 사진을 바로 찍기 위해 카메라를 씁니다.',
    NSPhotoLibraryAddUsageDescription: '완성한 펼침면을 이미지로 저장하기 위해 사진첩에 넣습니다.',
  };
  for (const [key, text] of Object.entries(needs)) {
    if (s.includes('<key>' + key + '</key>')) continue;
    s = s.replace('</dict>\n</plist>', `\t<key>${key}</key>\n\t<string>${text}</string>\n</dict>\n</plist>`);
  }
  return s;
}, 'iOS Info.plist — 세로 고정 · 아이패드 뺌 · 사진/카메라 설명');

const PBX = path.join(M, 'ios/App/App.xcodeproj/project.pbxproj');
edit(PBX, s => {
  s = s.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, 'TARGETED_DEVICE_FAMILY = "1";');
  /* 팀 ID 를 Debug·Release 양쪽에 — 한쪽만 넣으면 Archive 때만 죽는다 */
  if (!s.includes('DEVELOPMENT_TEAM = ' + TEAM)) {
    s = s.replace(/DEVELOPMENT_TEAM = [^;]*;/g, `DEVELOPMENT_TEAM = ${TEAM};`);
    s = s.replace(/(\n(\s+)PRODUCT_BUNDLE_IDENTIFIER = sarl\.diaru\.app;)/g,
      (m, whole, indent) => s.includes('DEVELOPMENT_TEAM') ? whole : `\n${indent}DEVELOPMENT_TEAM = ${TEAM};${whole}`);
  }
  if (!s.includes('DEVELOPMENT_TEAM')) {
    s = s.replace(/(\n(\s+)PRODUCT_BUNDLE_IDENTIFIER = sarl\.diaru\.app;)/g,
      (_, whole, indent) => `\n${indent}DEVELOPMENT_TEAM = ${TEAM};${whole}`);
  }
  return s;
}, 'iOS project.pbxproj — 폰 전용 · 팀 ID');

/* 공유 스킴 — 없으면 Xcode 가 기계마다 제멋대로 만들고, 그러다 Run 이 회색이 된다.
   StoreKit 설정 파일은 일부러 넣지 않는다(결제가 가짜가 된다). */
const SCHEME_DIR = path.join(M, 'ios/App/App.xcodeproj/xcshareddata/xcschemes');
const SCHEME = path.join(SCHEME_DIR, 'App.xcscheme');
if (fs.existsSync(path.join(M, 'ios/App/App.xcodeproj'))) {
  if (fs.existsSync(SCHEME)) note(true, 'iOS 공유 스킴 (이미 있음)');
  else if (CHECK) note(false, 'iOS 공유 스킴 — 없다');
  else {
    fs.mkdirSync(SCHEME_DIR, { recursive: true });
    fs.writeFileSync(SCHEME, `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1500" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "504EC3081FED79650016851F" BuildableName = "App.app" BlueprintName = "App" ReferencedContainer = "container:App.xcodeproj"></BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES"></TestAction>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "504EC3081FED79650016851F" BuildableName = "App.app" BlueprintName = "App" ReferencedContainer = "container:App.xcodeproj"></BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "504EC3081FED79650016851F" BuildableName = "App.app" BlueprintName = "App" ReferencedContainer = "container:App.xcodeproj"></BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration = "Debug"></AnalyzeAction>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES"></ArchiveAction>
</Scheme>
`);
    changed++; note(true, 'iOS 공유 스킴');
  }
}

/* ── 안드로이드 ──────────────────────────────────────── */
edit(path.join(M, 'android/app/src/main/AndroidManifest.xml'), s => {
  if (s.includes('android:screenOrientation')) return s;
  return s.replace('android:name=".MainActivity"',
    'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
}, '안드로이드 AndroidManifest — 세로 고정');

/* MainActivity — `cap add android` 가 덮어쓰는 파일이다.
   원본은 mobile/native/MainActivity.java 에 두고 여기서 제자리에 넣는다(한 벌만 둔다). */
{
  const src = path.join(M, 'native/MainActivity.java');
  const dst = path.join(M, 'android/app/src/main/java/sarl/diaru/app/MainActivity.java');
  const want = fs.existsSync(src) ? fs.readFileSync(src, 'utf8') : null;
  const have = fs.existsSync(dst) ? fs.readFileSync(dst, 'utf8') : null;
  if (!want) note(false, 'MainActivity 원본이 없다(mobile/native/MainActivity.java)');
  else if (want === have) note(true, '안드로이드 MainActivity — 내비게이션 바 숨김 (이미 맞음)');
  else if (CHECK) note(false, '안드로이드 MainActivity — 덮어써져 있다(내비게이션 바가 다시 겹친다)');
  else { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, want); changed++;
         note(true, '안드로이드 MainActivity — 내비게이션 바 숨김'); }
}

edit(path.join(M, 'android/app/build.gradle'), s => {
  if (s.includes('signingConfigs')) return s;
  /* keystore.properties 가 있으면 release 를 서명한다. 없으면 그냥 지나간다(디버그 빌드는 계속 된다).
     ⚠ 그 파일은 저장소에 들어가면 안 된다 — .gitignore 에 **이름으로** 적는다(경로로 적으면 샌다). */
  const block = `
/* 서명 — mobile/android/keystore.properties 를 읽는다(저장소에 없다).
     storeFile=C:/…/diaru-upload.jks
     storePassword=…
     keyAlias=upload
     keyPassword=…
   없으면 release 는 서명 없이 빌드된다(Play 는 안 받는다). */
def keystoreFile = rootProject.file("keystore.properties")
def keystoreProps = new Properties()
if (keystoreFile.exists()) keystoreProps.load(new FileInputStream(keystoreFile))

android {
    signingConfigs {
        if (keystoreFile.exists()) {
            release {
                storeFile file(keystoreProps['storeFile'])
                storePassword keystoreProps['storePassword']
                keyAlias keystoreProps['keyAlias']
                keyPassword keystoreProps['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            if (keystoreFile.exists()) signingConfig signingConfigs.release
        }
    }
}
`;
  return s.trimEnd() + '\n' + block;
}, '안드로이드 build.gradle — 서명 설정');

console.log(CHECK
  ? (problems.length ? `\n어긋난 것 ${problems.length}개` : '\n전부 박혀 있다')
  : `\n${changed}곳 고침` + (problems.length ? ` · 못 한 것 ${problems.length}개` : ''));
process.exit(CHECK && problems.length ? 1 : 0);
