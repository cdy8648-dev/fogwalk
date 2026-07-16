// geodata/<ISO3>-ADM1.geojson → src/constants/regionPacks/<cc>.json  (또는 packs/ 배포용)
// 글로벌 지역팩(ADM1 전용): 국가의 주/도/현 폴리곤을 res7로 폴리필 → compact.
// KR 팩과 달리 ADM1 피처가 곧 지역(유니크 이름) → 정적 명단·동명 판별 불필요.
// 하위구역(시군구) 없음 → subdivided:false (여권은 지역까지만 표시).
//
// 실행: node scripts/gen-global-pack.js JPN jp   (ADM1 geojson ISO3, 출력 cc 소문자)
// 경계 출처: geoBoundaries.org gbOpen (CC BY / ODbL — 국가별 상이, 팩에 attribution 기록)
const fs = require('fs');
const path = require('path');
const {
  polygonToCells, compactCells, cellToChildrenSize, getResolution,
} = require('h3-js');

const ISO3 = process.argv[2];
const CC = process.argv[3];
if (!ISO3 || !CC) {
  console.error('사용법: node scripts/gen-global-pack.js <ISO3> <cc>  (예: JPN jp)');
  process.exit(1);
}
const RES = 7; // ~5.16km² — 주/도/현 단위. 대국도 감당되게 KR(res8)보다 한 단계 성김.
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'geodata', `${ISO3}-ADM1.geojson`);
// 배포용(다운로드) — 리포 루트 packs/ 에 두고 GitHub raw로 호스팅. 앱 번들 아님(KR만 src에 번들).
const OUT = path.join(ROOT, 'packs', `${CC}.json`);

// shapeName 정리: 'Osaka Prefecture' → 'Osaka', 'Tokyo Metropolis' → 'Tokyo'.
// (지역 표시명. 현지어/한글 오버레이는 국가별 localization으로 추후 덮어씀.)
function cleanName(s) {
  return s
    .replace(/\s+(Prefecture|Metropolis|Province|Region|Circuit|Do|To|Fu|Ken)$/i, '')
    .trim();
}

function cellsOfFeature(geom) {
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
  const out = [];
  for (const coords of polys) {
    try {
      // 주의: out.push(...arr) 스프레드는 대형 배열(알래스카 등 수십만 셀)에서
      // "Maximum call stack size exceeded"로 터진다 → 루프 push.
      const cells = polygonToCells(coords, RES, true); // isGeoJson=true ([lng,lat])
      for (const c of cells) out.push(c);
    } catch (e) {
      console.warn('polyfill 실패(스킵 폴리곤):', e.message);
    }
  }
  return out;
}

function main() {
  const a1 = JSON.parse(fs.readFileSync(SRC, 'utf8'));

  const level1 = [];   // { key(표시명), en(원문 shapeName), iso(ISO 3166-2) }
  const claim = new Map(); // res7 cell → l1 idx (경계 중복은 선착순)
  let dup = 0;
  for (const f of a1.features) {
    const en = f.properties.shapeName;
    const iso = f.properties.shapeISO || '';
    const idx = level1.push({ key: cleanName(en), en, iso }) - 1;
    for (const c of cellsOfFeature(f.geometry)) {
      if (claim.has(c)) dup++;
      else claim.set(c, idx);
    }
  }

  // 지역별 compact + 분모(res10 자식 수 합)
  const byL1 = new Map();
  for (const [c, idx] of claim) {
    if (!byL1.has(idx)) byL1.set(idx, []);
    byL1.get(idx).push(c);
  }
  const cells = {};
  const l1Tiles = new Array(level1.length).fill(0);
  let resMin = RES;
  for (const [idx, list] of byL1) {
    for (const c of compactCells(list)) {
      cells[c] = idx;
      resMin = Math.min(resMin, getResolution(c));
      l1Tiles[idx] += cellToChildrenSize(c, 10);
    }
  }

  // ADM1 전용: level2는 level1의 1:1 미러(포맷 통일). subdivided:false → 여권은 지역까지만.
  const level2 = level1.map((l, i) => ({ name: l.key, l1: i }));
  const l2Tiles = l1Tiles.slice();

  const pack = {
    v: 1,
    country: CC.toUpperCase(),
    subdivided: false,
    resMin,
    resMax: RES,
    attribution: 'Boundaries © geoBoundaries.org (gbOpen)',
    level1,
    level2,
    l1Tiles,
    l2Tiles,
    cells,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(pack));

  const bytes = fs.statSync(OUT).size;
  console.log(`✅ ${CC}.json: 지역 ${level1.length} · compact cells ${Object.keys(cells).length} (res ${resMin}~${RES})`);
  console.log(`   res7 클레임 ${claim.size}개, 경계 중복 ${dup}개`);
  console.log(`   파일 크기: ${(bytes / 1024 / 1024).toFixed(2)} MB (원본 JSON)`);
  // 총 타일·최대 지역
  const total = l1Tiles.reduce((a, b) => a + b, 0);
  const top = level1
    .map((l, i) => [l.key, l1Tiles[i]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  console.log(`   총 ${total.toLocaleString()} 타일. 최대: ${top.map(([n, t]) => `${n} ${t.toLocaleString()}`).join(', ')}`);
}

main();
