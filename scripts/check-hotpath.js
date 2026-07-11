// 핫패스(위치 콜백 경로) 배터리 헌장 검사 — AGENTS.md '배터리 헌장' 참조.
// 백그라운드에서 시간당 수천 번 도는 파일에 네트워크 호출·풀 테이블 로드가
// 들어오면 커밋 전에 잡는다. 실행: node scripts/check-hotpath.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 핫패스 파일 (여기 추가되는 파일은 AGENTS.md 헌장도 갱신할 것)
const HOT_FILES = [
  'src/services/locationPipeline.ts',
  'src/tasks/locationTask.ts',
  'src/tasks/geofenceTask.ts',
  'src/services/progress.ts',
];

// 금지 토큰: [패턴, 이유]
const FORBIDDEN = [
  [/\bfetch\s*\(/, '직접 네트워크 호출 (헌장 1조)'],
  [/reverseGeocodeAsync/, '역지오코딩 — 네트워크+지오코더 (헌장 1조)'],
  [/getDiscoveredLandmarks\s*\(/, '발견 랜드마크 전체 로드 (헌장 2조)'],
  [/getAllPhotos\s*\(/, '사진 전체 로드 (헌장 2조)'],
  [/getAllVisitedTileIds\s*\(/, '방문 타일 전체 로드 (헌장 2조)'],
  [/getAllPlaces\s*\(/, '장소 전체 로드 (헌장 2조)'],
];

// 예외: 같은 줄 또는 직전 줄에 'hotpath-allow' 주석이 있으면 통과
// (예: AppState 'active' 게이트 뒤의 의도된 호출)
let failed = false;

for (const rel of HOT_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  ${rel} 없음 — HOT_FILES 목록 갱신 필요`);
    continue;
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('hotpath-allow')) return;
    if (i > 0 && lines[i - 1].includes('hotpath-allow')) return;
    for (const [pattern, reason] of FORBIDDEN) {
      if (pattern.test(line)) {
        console.error(`❌ ${rel}:${i + 1} — ${reason}\n   ${line.trim()}`);
        failed = true;
      }
    }
  });
}

if (failed) {
  console.error('\n핫패스 배터리 헌장 위반. AGENTS.md 참조 — 포그라운드 게이트 뒤로 옮기거나 설계 재고.');
  process.exit(1);
}
console.log(`✅ hotpath clean (${HOT_FILES.length} files)`);
