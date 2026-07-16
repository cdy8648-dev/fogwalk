// geodata/KOR-ADM{1,2}.geojson → src/constants/regionPacks/kr.json
// H3 멤버십 팩: 시군구 폴리곤을 res8로 폴리필 → 전역 중복 제거 → 지역별 compact.
// 조회(타일→지역)는 앱에서 부모 셀 룩업 O(1). 분모는 compact 셀의 res10 자식 수 합(정확).
// 실행: node scripts/gen-region-pack.js   (경계 데이터 출처: geoBoundaries.org CC-BY 3.0)
//
// ── 소속 시/도 판정 (2026-07 재작성) ────────────────────────────
// geoBoundaries의 ADM1(도) 폴리곤은 광역시 경계에서 부정확하다(서울/인천/대전 등이
// 실제보다 작게 그려져 은평구·계양구·대전 동구가 인접 도로 새고, 반대로 res6 폴리필은
// 과천·구리를 서울로 삼킨다). 그래서 도 판정에 ADM1 '경계 폴리곤'을 신뢰하지 않는다.
//   · 고유 이름 시군구 → 정적 명단(REGIONS)으로 도 확정 (지오메트리 불필요, 100% 정확)
//   · 동명 구(중구/동구/서구/남구/북구/강서구/고성군) → 후보 도의 '중심점' 최근접으로 판별
//     (중심점은 경계 오차에 강하고, 동명 구는 광역시 도심이라 자기 도 중심에 최근접 — 검증됨)
// 타일→지역 셀 자체는 ADM2 폴리곤 폴리필로 만든다(ADM2는 신뢰 가능).
const fs = require('fs');
const path = require('path');
const {
  polygonToCells, compactCells, cellToParent, cellToChildrenSize, getResolution, cellToLatLng,
} = require('h3-js');

const ROOT = path.join(__dirname, '..');
const RES = 8; // 폴리필 해상도 (~0.74km² — 구 단위 정밀도)
const OUT = path.join(ROOT, 'src', 'constants', 'regionPacks', 'kr.json');

// ── ADM1 영문 → 도 key(정규화 한글, reverseGeocode normalizeRegion과 동일) ──
const L1_KO = {
  Seoul: '서울', Busan: '부산', Daegu: '대구', Incheon: '인천', Gwangju: '광주',
  Daejeon: '대전', Ulsan: '울산', Sejong: '세종', 'Sejong-si': '세종',
  Gyeonggi: '경기', Gangwon: '강원',
  'North Chungcheong': '충북', 'South Chungcheong': '충남',
  'North Jeolla': '전북', 'South Jeolla': '전남',
  'North Gyeongsang': '경북', 'South Gyeongsang': '경남',
  Jeju: '제주',
};

// ── 도(道) → 시군구 [로마자 shapeName, 한글] 정적 명단(권위 소스) ──────────
// 로마자는 geoBoundaries shapeName(동명 접미사 '[...]'는 빌드에서 제거). 경계 vintage 2020.
const REGIONS = {
  '서울': [
    ['Jongno-gu','종로구'],['Jung-gu','중구'],['Yongsan-gu','용산구'],['Seongdong-gu','성동구'],['Gwangjin-gu','광진구'],
    ['Dongdaemun-gu','동대문구'],['Jungnang-gu','중랑구'],['Seongbuk-gu','성북구'],['Gangbuk-gu','강북구'],['Dobong-gu','도봉구'],
    ['Nowon-gu','노원구'],['Eunpyeong-gu','은평구'],['Seodaemun-gu','서대문구'],['Mapo-gu','마포구'],['Yangcheon-gu','양천구'],
    ['Gangseo-gu','강서구'],['Guro-gu','구로구'],['Geumcheon-gu','금천구'],['Yeongdeungpo-gu','영등포구'],['Dongjak-gu','동작구'],
    ['Gwanak-gu','관악구'],['Seocho-gu','서초구'],['Gangnam-gu','강남구'],['Songpa-gu','송파구'],['Gangdong-gu','강동구'],
  ],
  '부산': [
    ['Jung-gu','중구'],['Seo-gu','서구'],['Dong-gu','동구'],['Yeongdo-gu','영도구'],['Busanjin-gu','부산진구'],['Dongnae-gu','동래구'],
    ['Nam-gu','남구'],['Buk-gu','북구'],['Haeundae-gu','해운대구'],['Saha-gu','사하구'],['Geumjeong-gu','금정구'],['Gangseo-gu','강서구'],
    ['Yeonje-gu','연제구'],['Suyeong-gu','수영구'],['Sasang-gu','사상구'],['Gijang-gun','기장군'],
  ],
  '대구': [
    ['Jung-gu','중구'],['Dong-gu','동구'],['Seo-gu','서구'],['Nam-gu','남구'],['Buk-gu','북구'],
    ['Suseong-gu','수성구'],['Dalseo-gu','달서구'],['Dalseong-gun','달성군'],
  ],
  '인천': [
    ['Jung-gu','중구'],['Dong-gu','동구'],['Michuhol-gu','미추홀구'],['Yeonsu-gu','연수구'],['Namdong-gu','남동구'],
    ['Bupyeong-gu','부평구'],['Gyeyang-gu','계양구'],['Seo-gu','서구'],['Ganghwa-gun','강화군'],['Ongjin-gun','옹진군'],
  ],
  '광주': [
    ['Dong-gu','동구'],['Seo-gu','서구'],['Nam-gu','남구'],['Buk-gu','북구'],['Gwangsan-gu','광산구'],
  ],
  '대전': [
    ['Dong-gu','동구'],['Jung-gu','중구'],['Seo-gu','서구'],['Yuseong-gu','유성구'],['Daedeok-gu','대덕구'],
  ],
  '울산': [
    ['Jung-gu','중구'],['Nam-gu','남구'],['Dong-gu','동구'],['Buk-gu','북구'],['Ulju-gun','울주군'],
  ],
  '세종': [
    ['Sejong-si','세종시'],
  ],
  '경기': [
    ['Suwon-si','수원시'],['Seongnam-si','성남시'],['Uijeongbu-si','의정부시'],['Anyang-si','안양시'],['Bucheon-si','부천시'],
    ['Gwangmyeong-si','광명시'],['Pyeongtaek-si','평택시'],['Dongducheon-si','동두천시'],['Ansan-si','안산시'],['Goyang-si','고양시'],
    ['Gwacheon-si','과천시'],['Guri-si','구리시'],['Namyangju-si','남양주시'],['Osan-si','오산시'],['Siheung-si','시흥시'],
    ['Gunpo-si','군포시'],['Uiwang-si','의왕시'],['Hanam-si','하남시'],['Yongin-si','용인시'],['Paju-si','파주시'],
    ['Icheon-si','이천시'],['Anseong-si','안성시'],['Gimpo-si','김포시'],['Hwaseong-si','화성시'],['Gwangju-si','광주시'],
    ['Yangju-si','양주시'],['Pocheon-si','포천시'],['Yeoju','여주시'],['Yeoncheon-gun','연천군'],['Gapyeong-gun','가평군'],
    ['Yangpyeong-gun','양평군'],
  ],
  '강원': [
    ['Chuncheon-si','춘천시'],['Wonju-si','원주시'],['Gangneung-si','강릉시'],['Donghae-si','동해시'],['Taebaek-si','태백시'],
    ['Sokcho-si','속초시'],['Samcheok-si','삼척시'],['Hongcheon-gun','홍천군'],['Hoengseong-gun','횡성군'],['Yeongwol-gun','영월군'],
    ['Pyeongchang-gun','평창군'],['Jeongseon-gun','정선군'],['Cheorwon-gun','철원군'],['Hwacheon-gun','화천군'],['Yanggu-gun','양구군'],
    ['Inje-gun','인제군'],['Goseong-gun','고성군'],['Yangyang-gun','양양군'],
  ],
  '충북': [
    ['Cheongju-si','청주시'],['Chungju-si','충주시'],['Jecheon-si','제천시'],['Boeun-gun','보은군'],['Okcheon-gun','옥천군'],
    ['Yeongdong-gun','영동군'],['Jeungpyeong-gun','증평군'],['Jincheon-gun','진천군'],['Goesan-gun','괴산군'],['Eumseong-gun','음성군'],
    ['Danyang-gun','단양군'],
  ],
  '충남': [
    ['Cheonan-si','천안시'],['Gongju-si','공주시'],['Boryeong-si','보령시'],['Asan-si','아산시'],['Seosan-si','서산시'],
    ['Nonsan-si','논산시'],['Gyeryong-si','계룡시'],['Dangjin-si','당진시'],['Geumsan-gun','금산군'],['Buyeo-gun','부여군'],
    ['Seocheon-gun','서천군'],['Cheongyang-gun','청양군'],['Hongseong-gun','홍성군'],['Yesan-gun','예산군'],['Taean-gun','태안군'],
  ],
  '전북': [
    ['Jeonju-si','전주시'],['Gunsan-si','군산시'],['Iksan-si','익산시'],['Jeongeup-si','정읍시'],['Namwon-si','남원시'],
    ['Gimje-si','김제시'],['Wanju-gun','완주군'],['Jinan-gun','진안군'],['Muju-gun','무주군'],['Jangsu-gun','장수군'],
    ['Imsil-gun','임실군'],['Sunchang-gun','순창군'],['Gochang-gun','고창군'],['Buan-gun','부안군'],
  ],
  '전남': [
    ['Mokpo-si','목포시'],['Yeosu-si','여수시'],['Suncheon-si','순천시'],['Naju-si','나주시'],['Gwangyang-si','광양시'],
    ['Damyang-gun','담양군'],['Gokseong-gun','곡성군'],['Gurye-gun','구례군'],['Goheung-gun','고흥군'],['Boseong-gun','보성군'],
    ['Hwasun-gun','화순군'],['Jangheung-gun','장흥군'],['Gangjin-gun','강진군'],['Haenam-gun','해남군'],['Yeongam-gun','영암군'],
    ['Muan-gun','무안군'],['Hampyeong-gun','함평군'],['Jangseong-gun','장성군'],['Wando-gun','완도군'],
    // 영광군: 이 geoBoundaries ADM2 데이터엔 폴리곤 자체가 누락(데이터 갭) → 팩 미포함, 방문 시 역지오코딩 폴백.
    ['Jindo-gun','진도군'],['Sinan-gun','신안군'],
  ],
  '경북': [
    ['Pohang-si','포항시'],['Gyeongju-si','경주시'],['Gimcheon-si','김천시'],['Andong-si','안동시'],['Gumi-si','구미시'],
    ['Yeongju-si','영주시'],['Yeongcheon-si','영천시'],['Sangju-si','상주시'],['Mungyeong-si','문경시'],['Gyeongsan-si','경산시'],
    ['Gunwi-gun','군위군'],['Uiseong-gun','의성군'],['Cheongsong-gun','청송군'],['Yeongyang-gun','영양군'],['Yeongdeok-gun','영덕군'],
    ['Cheongdo-gun','청도군'],['Goryeong-gun','고령군'],['Seongju-gun','성주군'],['Chilgok-gun','칠곡군'],['Yecheon-gun','예천군'],
    ['Bonghwa-gun','봉화군'],['Uljin-gun','울진군'],['Ulleung-gun','울릉군'],
  ],
  '경남': [
    ['Changwon-si','창원시'],['Jinju-si','진주시'],['Tongyeong-si','통영시'],['Sacheon-si','사천시'],['Gimhae-si','김해시'],
    ['Miryang-si','밀양시'],['Geoje-si','거제시'],['Yangsan-si','양산시'],['Uiryeong-gun','의령군'],['Haman-gun','함안군'],
    ['Changnyeong-gun','창녕군'],['Goseong-gun','고성군'],['Namhae-gun','남해군'],['Hadong-gun','하동군'],['Sancheong-gun','산청군'],
    ['Hamyang-gun','함양군'],['Geochang-gun','거창군'],['Hapcheon-gun','합천군'],
  ],
  '제주': [
    ['Jeju-si','제주시'],['Seogwipo-si','서귀포시'],
  ],
};

// ── REGIONS → 조회 인덱스 ────────────────────────────────────────
const L1_KEYS = Object.keys(REGIONS);
const KO = {};        // roman → 한글 이름 (동명도 한글 동일)
const CAND = {};      // roman → [도 index 후보]
L1_KEYS.forEach((key, li) => {
  for (const [roman, ko] of REGIONS[key]) {
    KO[roman] = ko;
    (CAND[roman] ??= []).push(li);
  }
});

// ── 지오메트리 → res8 셀 목록 ──────────────────────────────────
function cellsOfFeature(geom) {
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
  const out = [];
  for (const coords of polys) {
    try {
      // out.push(...arr) 스프레드는 대형 배열에서 스택 오버플로 → 루프 push.
      const cells = polygonToCells(coords, RES, true); // isGeoJson=true ([lng,lat])
      for (const c of cells) out.push(c);
    } catch (e) {
      console.warn('polyfill 실패(스킵 폴리곤):', e.message);
    }
  }
  return out;
}
// 셀 중심 평균 = 경계 오차에 강한 대표 중심점 [lat, lng]
function centroidOf(cells) {
  let la = 0, ln = 0;
  for (const c of cells) { const [a, b] = cellToLatLng(c); la += a; ln += b; }
  return [la / cells.length, ln / cells.length];
}

function main() {
  const a1 = JSON.parse(fs.readFileSync(path.join(ROOT, 'geodata', 'KOR-ADM1.geojson'), 'utf8'));
  const a2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'geodata', 'KOR-ADM2.geojson'), 'utf8'));

  // level1 = REGIONS 도 목록. en 필드는 참고용(앱은 key만 사용).
  const KEY_EN = {};
  for (const [en, ko] of Object.entries(L1_KO)) if (!(ko in KEY_EN)) KEY_EN[ko] = en;
  const level1 = L1_KEYS.map((key) => ({ key, en: KEY_EN[key] ?? key }));

  // 도 중심점(동명 판별용) — ADM1 폴리곤의 '중심'만 쓴다(경계 아님 → 오차에 강함).
  const l1Centroid = new Array(L1_KEYS.length).fill(null);
  for (const f of a1.features) {
    const key = L1_KO[f.properties.shapeName];
    if (!key) throw new Error(`ADM1 한글 매핑 누락: ${f.properties.shapeName}`);
    const li = L1_KEYS.indexOf(key);
    l1Centroid[li] = centroidOf(cellsOfFeature(f.geometry));
  }
  const nearestCand = (c, cand) => {
    let best = cand[0], bd = Infinity;
    for (const li of cand) {
      const cc = l1Centroid[li];
      const d = (cc[0] - c[0]) ** 2 + (cc[1] - c[1]) ** 2;
      if (d < bd) { bd = d; best = li; }
    }
    return best;
  };

  // LEVEL2: 각 ADM2 → 도 판정(정적/중심점) + res8 전역 클레임(선착순) → 지역별 compact
  const level2 = [];
  const claim = new Map(); // res8 cell → l2 idx
  let dup = 0;
  const unmatched = new Set();
  for (const f of a2.features) {
    const raw = f.properties.shapeName;
    const base = raw.replace(/\s*\[.*\]\s*$/, ''); // 'Jung-gu [Central District]' → 'Jung-gu'
    const cand = CAND[base];
    if (!cand) { unmatched.add(raw); continue; }
    const cells = cellsOfFeature(f.geometry);
    if (cells.length === 0) continue;
    const li = cand.length === 1 ? cand[0] : nearestCand(centroidOf(cells), cand);
    const idx = level2.push({ name: KO[base], l1: li }) - 1;
    for (const c of cells) {
      if (claim.has(c)) dup++;
      else claim.set(c, idx);
    }
  }

  // 지역별 compact (같은 지역이 res8 7자식을 전부 가질 때만 부모로 승격 → 룩업 모호성 없음)
  const byL2 = new Map();
  for (const [c, idx] of claim) {
    if (!byL2.has(idx)) byL2.set(idx, []);
    byL2.get(idx).push(c);
  }
  const cells = {};
  const l2Tiles = new Array(level2.length).fill(0);
  let resMin = RES;
  for (const [idx, list] of byL2) {
    for (const c of compactCells(list)) {
      cells[c] = idx;
      resMin = Math.min(resMin, getResolution(c));
      l2Tiles[idx] += cellToChildrenSize(c, 10); // res10 타일 수(정확)
    }
  }
  const l1Tiles = new Array(level1.length).fill(0);
  level2.forEach((l2, i) => (l1Tiles[l2.l1] += l2Tiles[i]));

  const pack = {
    v: 1,
    country: 'KR',
    resMin,
    resMax: RES,
    attribution: 'Boundaries © geoBoundaries.org (CC BY 3.0)',
    level1,
    level2,
    l1Tiles,
    l2Tiles,
    cells,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(pack));

  console.log(`✅ kr.json: L1 ${level1.length} · L2 ${level2.length} · compact cells ${Object.keys(cells).length} (res ${resMin}~${RES})`);
  console.log(`   res8 클레임 ${claim.size}개, 경계 중복(선착순 처리) ${dup}개`);
  console.log(`   파일 크기: ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`);
  if (unmatched.size) console.log(`   ❗ 명단 미매칭 ${unmatched.size}건: ${[...unmatched].join(', ')}`);
  // REGIONS 항목 중 ADM2에 없는 것(오타/누락) 역검증
  const seen = new Set(level2.map((l) => `${level1[l.l1].key}/${l.name}`));
  const missing = [];
  L1_KEYS.forEach((key) => REGIONS[key].forEach(([, ko]) => {
    if (!seen.has(`${key}/${ko}`)) missing.push(`${key}/${ko}`);
  }));
  if (missing.length) console.log(`   ❗ 명단엔 있으나 지오데이터에 없음 ${missing.length}건: ${missing.join(', ')}`);
  // 검증 샘플 — 과거 오분류 포함
  const find = (l1, n) => level2.findIndex((x) => x.name === n && level1[x.l1].key === l1);
  for (const [l1, n] of [['경기','과천시'],['경기','구리시'],['서울','은평구'],['인천','계양구'],['인천','서구'],['대전','동구'],['세종','세종시'],['서울','강남구']]) {
    const i = find(l1, n);
    console.log(`   ${l1} ${n}: ${i >= 0 ? `✓ ${l2Tiles[i].toLocaleString()} 타일` : '❌ 없음'}`);
  }
}

main();
