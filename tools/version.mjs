/* ============================================================
   version.mjs — 버전을 네 자리에 한 번에 찍는다.

     node tools/version.mjs            # 오늘 날짜로 다음 번호
     node tools/version.mjs --show     # 지금 박혀 있는 값만 본다
     node tools/version.mjs --build 3  # 그날의 몇 번째인지 직접

   네 자리란:
     android/app/build.gradle   versionCode · versionName
     ios/App/App.xcodeproj/project.pbxproj   CURRENT_PROJECT_VERSION · MARKETING_VERSION

   손으로 고치면 반드시 한 번은 어긋난다(SHIPPING.md §4 — 2026-10 에 두 앱에서 당했다).
   번호를 1,2,3… 으로 세지 않는 이유도 거기 있다: Play 는 한 번 쓴 versionCode 를
   영영 안 받고, 어디까지 썼는지는 사람이 기억해야 한다. 날짜로 매기면 기억할 것이 없다.

     versionName  1.0.MMDD     사람이 보는 것    예 1.0.1021
     versionCode  YYMMDDnn     스토어가 보는 것  예 26102101   nn = 그날의 몇 번째

   날짜는 **KST 로 센다** — UTC 로 세면 밤에 하루 어긋난다.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GRADLE = path.join(ROOT, 'mobile/android/app/build.gradle');
const PBX = path.join(ROOT, 'mobile/ios/App/App.xcodeproj/project.pbxproj');
const has = k => process.argv.includes(k);
const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };

const kst = new Date(Date.now() + 9 * 36e5);
const yy = String(kst.getUTCFullYear()).slice(2);
const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
const dd = String(kst.getUTCDate()).padStart(2, '0');

function read(file, re) {
  try { const m = fs.readFileSync(file, 'utf8').match(re); return m ? m[1] : null; } catch { return null; }
}
const current = {
  androidCode: read(GRADLE, /versionCode\s+(\d+)/),
  androidName: read(GRADLE, /versionName\s+"([^"]+)"/),
  iosBuild: read(PBX, /CURRENT_PROJECT_VERSION = ([^;]+);/),
  iosName: read(PBX, /MARKETING_VERSION = ([^;]+);/),
};

if (has('--show')) {
  console.log('안드로이드  versionCode', current.androidCode, '· versionName', current.androidName);
  console.log('iOS         Build', current.iosBuild, '· Version', current.iosName);
  process.exit(0);
}

/* 그날의 몇 번째인가 — 이미 오늘 날짜로 찍혀 있으면 하나 올린다 */
let nn = Number(argOf('--build', 0));
if (!nn) {
  const prev = Number(current.androidCode || 0);
  const todayHead = Number(yy + mm + dd);
  nn = Math.floor(prev / 100) === todayHead ? (prev % 100) + 1 : 1;
}
if (nn > 99) { console.error('하루에 99번까지다. 날짜가 바뀌길 기다리거나 --build 로 정해라.'); process.exit(1); }

/* 버전 이름을 직접 줄 수도 있다 — `--name 1.0`.
   App Store Connect 의 「버전」 레코드와 빌드의 CFBundleShortVersionString 이 **같아야**
   그 버전에 빌드가 붙는다. 반려를 받고 다시 낼 때는 ASC 에 이미 있는 이름(보통 1.0)을
   그대로 쓰고 빌드 번호만 올리는 것이 맞다. 새 이름을 쓰려면 ASC 에 그 버전을 새로 만들어야 한다. */
const versionName = argOf('--name', '') || `1.0.${mm}${dd}`;
const versionCode = Number(`${yy}${mm}${dd}${String(nn).padStart(2, '0')}`);

let touched = 0, missing = [];
function patch(file, subs, label) {
  if (!fs.existsSync(file)) { missing.push(label); return; }
  let s = fs.readFileSync(file, 'utf8'), before = s;
  for (const [re, to] of subs) {
    if (!re.test(s)) { console.error(`  ✗ ${label}: ${re} 를 못 찾았다`); process.exitCode = 1; return; }
    s = s.replace(new RegExp(re.source, 'g'), to);
  }
  if (s !== before) { fs.writeFileSync(file, s); touched++; }
  console.log(`  ✓ ${label}`);
}

patch(GRADLE, [
  [/versionCode\s+\d+/, `versionCode ${versionCode}`],
  [/versionName\s+"[^"]+"/, `versionName "${versionName}"`],
], 'android/app/build.gradle');

/* pbxproj 는 Debug·Release 양쪽에 같은 줄이 있다 — g 플래그로 둘 다 바꾼다 */
patch(PBX, [
  [/CURRENT_PROJECT_VERSION = [^;]+;/, `CURRENT_PROJECT_VERSION = ${versionCode};`],
  [/MARKETING_VERSION = [^;]+;/, `MARKETING_VERSION = ${versionName};`],
], 'ios project.pbxproj');

console.log(`\nversionName ${versionName} · versionCode ${versionCode}  (오늘의 ${nn}번째)`);
if (missing.length) console.log('아직 없는 곳:', missing.join(', '), '— `npx cap add` 를 먼저 돌려라');
if (!touched && !missing.length) console.log('바뀐 것 없음(이미 같은 값)');
