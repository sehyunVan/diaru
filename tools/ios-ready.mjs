/* ============================================================
   ios-ready.mjs — 맥에 들고 가기 전에, 윈도우에서 확인할 수 있는 것을 전부 확인한다.
     node tools/ios-ready.mjs

   **iOS 빌드는 이 기계에서 못 한다** — Xcode 는 macOS 전용이고 .ipa 는 거기서만 나온다.
   그래서 할 수 있는 일은 하나뿐이다: 맥에서 열었을 때 **Archive 말고는 할 일이 없게** 해 두는 것.
   아래 검사는 전부 「맥에 가서야 알게 되면 하루를 버리는」 것들이다(SHIPPING.md §4).
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IOS = path.join(ROOT, 'mobile/ios/App');
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };

let bad = 0;
const ok = (cond, what, why = '') => {
  console.log((cond ? '  ✓ ' : '  ✗ ') + what + (cond || !why ? '' : '\n      → ' + why));
  if (!cond) bad++;
};

const plist = read(path.join(IOS, 'App/Info.plist'));
const pbx = read(path.join(IOS, 'App.xcodeproj/project.pbxproj'));
const pkg = read(path.join(IOS, 'CapApp-SPM/Package.swift'));

console.log('프로젝트');
ok(!!pbx, 'Xcode 프로젝트가 있다', '`cd mobile && npx cap add ios`');
ok(!!plist, 'Info.plist 가 있다');
ok(fs.existsSync(path.join(IOS, 'App.xcodeproj/xcshareddata/xcschemes/App.xcscheme')),
  '공유 스킴이 저장소에 있다', '없으면 Xcode 가 기계마다 새로 만들고, 그 과정에서 Run 이 회색이 된다');
ok(!(pbx || '').includes('StoreKitConfigurationFileReference'),
  '스킴에 StoreKit 설정이 안 걸려 있다', 'Run 빌드의 결제가 애플의 로컬 시험 거래가 된다');

console.log('\n서명 — 안 박아 두면 `git pull` 한 번에 날아간다');
const teams = [...(pbx || '').matchAll(/DEVELOPMENT_TEAM = ([^;]+);/g)].map(m => m[1]);
ok(teams.length >= 2, `팀 ID 가 Debug·Release 양쪽에 있다 (${teams.length}곳)`,
  '화면엔 팀이 보이는데 빌드만 「팀이 없다」고 한다');
ok(teams.length > 0 && new Set(teams).size === 1, `팀 ID 가 한 값이다 (${[...new Set(teams)].join(', ')})`);

console.log('\n대상과 화면');
const fams = [...(pbx || '').matchAll(/TARGETED_DEVICE_FAMILY = "([^"]+)";/g)].map(m => m[1]);
ok(fams.length > 0 && fams.every(f => f === '1'), `폰 전용이다 (${[...new Set(fams)].join(', ')})`,
  '"1,2" 면 아이패드 스크린샷까지 요구받는다');
const ori = (plist || '').match(/<key>UISupportedInterfaceOrientations<\/key>\s*<array>([\s\S]*?)<\/array>/);
const oriList = ori ? [...ori[1].matchAll(/<string>UIInterfaceOrientation(\w+)<\/string>/g)].map(m => m[1]) : [];
ok(oriList.length === 1 && oriList[0] === 'Portrait', `세로 고정이다 (${oriList.join(', ') || '없음'})`);
ok(!(plist || '').includes('UISupportedInterfaceOrientations~ipad'), '아이패드 방향 목록이 빠져 있다');

console.log('\n권한 설명 — 없으면 사진 고르다 그 자리에서 죽는다');
for (const k of ['NSPhotoLibraryUsageDescription', 'NSCameraUsageDescription', 'NSPhotoLibraryAddUsageDescription'])
  ok((plist || '').includes('<key>' + k + '</key>'), k);

console.log('\n장면(Scene) — iOS 26/27 은 장면을 안 쓰는 앱을 실행 순간 죽인다');
ok((plist || '').includes('UIApplicationSceneManifest'), 'Info.plist 에 UIApplicationSceneManifest');
ok(!!read(path.join(IOS, 'App/SceneDelegate.swift')) || (read(path.join(IOS, 'App/AppDelegate.swift')) || '').includes('SceneDelegate'),
  'SceneDelegate 가 있다', 'EXC_BREAKPOINT 로 실행 즉시 죽고 2.1(a) 로 반려된다');

console.log('\n윈도우에서 구운 흔적 — 맥의 SPM 이 못 읽는 경로');
ok(pkg === null || !/path:\s*"[^"]*\\\\/.test(pkg),
  'Package.swift 경로가 슬래시다', '역슬래시면 플러그인을 통째로 못 싣고, 화면엔 「로그인이 그냥 안 된다」로만 보인다');

console.log('\n웹 번들');
const pub = path.join(IOS, 'App/public');
ok(fs.existsSync(path.join(pub, 'index.html')), '번들이 복사돼 있다', '`cd mobile && npm run sync`');
const idx = read(path.join(pub, 'index.html')) || '';
const api = (idx.match(/window\.DIARU_API=("[^"]*")/) || [])[1];
ok(!!api, `서버 주소가 박혀 있다 ${api || ''}`, '없으면 앱이 자기 자신을 찌른다 — 통째로 안 돈다');
for (const f of ['legal/privacy.html', 'legal/support.html', 'legal/delete.html'])
  ok(fs.existsSync(path.join(pub, f)), '번들에 ' + f);

console.log('\n버전');
const mv = (pbx || '').match(/MARKETING_VERSION = ([^;]+);/);
const cv = (pbx || '').match(/CURRENT_PROJECT_VERSION = ([^;]+);/);
ok(!!mv && !!cv, `Version ${mv ? mv[1] : '?'} · Build ${cv ? cv[1] : '?'}`);
const gradle = read(path.join(ROOT, 'mobile/android/app/build.gradle')) || '';
const aName = (gradle.match(/versionName\s+"([^"]+)"/) || [])[1];
const aCode = (gradle.match(/versionCode\s+(\d+)/) || [])[1];
ok(mv && cv && mv[1] === aName && cv[1] === aCode,
  `안드로이드와 같은 번호다 (${aName} / ${aCode})`,
  '두 스토어가 갈리면 앱 안 표시와 스토어 표시가 어긋난다');

console.log(bad ? `\n막힌 것 ${bad}개 — 맥에 가기 전에 고쳐라` : `
전부 통과. 맥에서는 이것만 하면 된다:

  git clone / pull   (Xcode 를 **닫아 둔 채로** — 열어 두고 pull 하면 project.pbxproj 가 되덮인다)
  cd diary/mobile && npm install
  npm run sync
  open ios/App/App.xcodeproj
  상단 대상 드롭다운에서 폰 이름을 직접 고른다   ← Any iOS Device 면 Run 이 영구히 회색이다
  ⌘R 로 폰에서 한 바퀴 (⌘B 는 컴파일만 한다 — 폰에 안 깔린다)
  Product > Archive > Distribute App

  Archive 전에 \`git status mobile/ios\` 가 깨끗한지 본다 —
  맥에서 고친 것이 커밋 안 되면 제출본과 저장소가 다른 물건이 된다.`);
process.exit(bad ? 1 : 0);
