// geodata/KOR-ADM{1,2}.geojson → src/constants/regionPacks/kr.json
// H3 멤버십 팩: 시군구 폴리곤을 res8로 폴리필 → 전역 중복 제거 → 지역별 compact.
// 조회(타일→지역)는 앱에서 부모 셀 룩업 O(1). 분모는 compact 셀의 res10 자식 수 합(정확).
// 실행: node scripts/gen-region-pack.js   (경계 데이터 출처: geoBoundaries.org CC-BY 3.0)
const fs = require('fs');
const path = require('path');
const { polygonToCells, compactCells, cellToParent, cellToChildrenSize, getResolution } =
  require('h3-js');

const ROOT = path.join(__dirname, '..');
const RES = 8; // 폴리필 해상도 (~0.74km² — 구 단위 정밀도)
const OUT = path.join(ROOT, 'src', 'constants', 'regionPacks', 'kr.json');

// ── ADM1 영문 → 우리 여권 키(정규화 한글) ──────────────────────
const L1_KO = {
  Seoul: '서울', Busan: '부산', Daegu: '대구', Incheon: '인천', Gwangju: '광주',
  Daejeon: '대전', Ulsan: '울산', Sejong: '세종', 'Sejong-si': '세종',
  Gyeonggi: '경기', Gangwon: '강원',
  'North Chungcheong': '충북', 'South Chungcheong': '충남',
  'North Jeolla': '전북', 'South Jeolla': '전남',
  'North Gyeongsang': '경북', 'South Gyeongsang': '경남',
  Jeju: '제주',
};

// ── ADM2 로마자 → 한글 (동명 구는 자동 공유: Jung-gu → 중구) ────
const L2_KO = {
  // 서울 25
  'Jongno-gu':'종로구','Jung-gu':'중구','Yongsan-gu':'용산구','Seongdong-gu':'성동구','Gwangjin-gu':'광진구',
  'Dongdaemun-gu':'동대문구','Jungnang-gu':'중랑구','Seongbuk-gu':'성북구','Gangbuk-gu':'강북구','Dobong-gu':'도봉구',
  'Nowon-gu':'노원구','Eunpyeong-gu':'은평구','Seodaemun-gu':'서대문구','Mapo-gu':'마포구','Yangcheon-gu':'양천구',
  'Gangseo-gu':'강서구','Guro-gu':'구로구','Geumcheon-gu':'금천구','Yeongdeungpo-gu':'영등포구','Dongjak-gu':'동작구',
  'Gwanak-gu':'관악구','Seocho-gu':'서초구','Gangnam-gu':'강남구','Songpa-gu':'송파구','Gangdong-gu':'강동구',
  // 부산
  'Seo-gu':'서구','Dong-gu':'동구','Yeongdo-gu':'영도구','Busanjin-gu':'부산진구','Dongnae-gu':'동래구',
  'Nam-gu':'남구','Buk-gu':'북구','Haeundae-gu':'해운대구','Saha-gu':'사하구','Geumjeong-gu':'금정구',
  'Yeonje-gu':'연제구','Suyeong-gu':'수영구','Sasang-gu':'사상구','Gijang-gun':'기장군',
  // 대구
  'Suseong-gu':'수성구','Dalseo-gu':'달서구','Dalseong-gun':'달성군','Gunwi-gun':'군위군',
  // 인천
  'Michuhol-gu':'미추홀구','Yeonsu-gu':'연수구','Namdong-gu':'남동구','Bupyeong-gu':'부평구','Gyeyang-gu':'계양구',
  'Ganghwa-gun':'강화군','Ongjin-gun':'옹진군',
  // 광주
  'Gwangsan-gu':'광산구',
  // 대전
  'Yuseong-gu':'유성구','Daedeok-gu':'대덕구',
  // 울산
  'Ulju-gun':'울주군',
  // 세종
  'Sejong-si':'세종시','Sejong':'세종시',
  // 경기 31
  'Suwon-si':'수원시','Seongnam-si':'성남시','Uijeongbu-si':'의정부시','Anyang-si':'안양시','Bucheon-si':'부천시',
  'Gwangmyeong-si':'광명시','Pyeongtaek-si':'평택시','Dongducheon-si':'동두천시','Ansan-si':'안산시','Goyang-si':'고양시',
  'Gwacheon-si':'과천시','Guri-si':'구리시','Namyangju-si':'남양주시','Osan-si':'오산시','Siheung-si':'시흥시',
  'Gunpo-si':'군포시','Uiwang-si':'의왕시','Hanam-si':'하남시','Yongin-si':'용인시','Paju-si':'파주시',
  'Icheon-si':'이천시','Anseong-si':'안성시','Gimpo-si':'김포시','Hwaseong-si':'화성시','Gwangju-si':'광주시',
  'Yangju-si':'양주시','Pocheon-si':'포천시','Yeoju-si':'여주시','Yeoju':'여주시','Yeoncheon-gun':'연천군','Gapyeong-gun':'가평군',
  'Yangpyeong-gun':'양평군',
  // 강원 18
  'Chuncheon-si':'춘천시','Wonju-si':'원주시','Gangneung-si':'강릉시','Donghae-si':'동해시','Taebaek-si':'태백시',
  'Sokcho-si':'속초시','Samcheok-si':'삼척시','Hongcheon-gun':'홍천군','Hoengseong-gun':'횡성군','Yeongwol-gun':'영월군',
  'Pyeongchang-gun':'평창군','Jeongseon-gun':'정선군','Cheorwon-gun':'철원군','Hwacheon-gun':'화천군','Yanggu-gun':'양구군',
  'Inje-gun':'인제군','Goseong-gun':'고성군','Yangyang-gun':'양양군',
  // 충북 11
  'Cheongju-si':'청주시','Chungju-si':'충주시','Jecheon-si':'제천시','Boeun-gun':'보은군','Okcheon-gun':'옥천군',
  'Yeongdong-gun':'영동군','Jeungpyeong-gun':'증평군','Jincheon-gun':'진천군','Goesan-gun':'괴산군','Eumseong-gun':'음성군',
  'Danyang-gun':'단양군',
  // 충남 15
  'Cheonan-si':'천안시','Gongju-si':'공주시','Boryeong-si':'보령시','Asan-si':'아산시','Seosan-si':'서산시',
  'Nonsan-si':'논산시','Gyeryong-si':'계룡시','Dangjin-si':'당진시','Geumsan-gun':'금산군','Buyeo-gun':'부여군',
  'Seocheon-gun':'서천군','Cheongyang-gun':'청양군','Hongseong-gun':'홍성군','Yesan-gun':'예산군','Taean-gun':'태안군',
  // 전북 14
  'Jeonju-si':'전주시','Gunsan-si':'군산시','Iksan-si':'익산시','Jeongeup-si':'정읍시','Namwon-si':'남원시',
  'Gimje-si':'김제시','Wanju-gun':'완주군','Jinan-gun':'진안군','Muju-gun':'무주군','Jangsu-gun':'장수군',
  'Imsil-gun':'임실군','Sunchang-gun':'순창군','Gochang-gun':'고창군','Buan-gun':'부안군',
  // 전남 22
  'Mokpo-si':'목포시','Yeosu-si':'여수시','Suncheon-si':'순천시','Naju-si':'나주시','Gwangyang-si':'광양시',
  'Damyang-gun':'담양군','Gokseong-gun':'곡성군','Gurye-gun':'구례군','Goheung-gun':'고흥군','Boseong-gun':'보성군',
  'Hwasun-gun':'화순군','Jangheung-gun':'장흥군','Gangjin-gun':'강진군','Haenam-gun':'해남군','Yeongam-gun':'영암군',
  'Muan-gun':'무안군','Hampyeong-gun':'함평군','Yeonggwang-gun':'영광군','Jangseong-gun':'장성군','Wando-gun':'완도군',
  'Jindo-gun':'진도군','Sinan-gun':'신안군',
  // 경북 22 (2020 기준 군위군은 위 대구 항목이 공유)
  'Pohang-si':'포항시','Gyeongju-si':'경주시','Gimcheon-si':'김천시','Andong-si':'안동시','Gumi-si':'구미시',
  'Yeongju-si':'영주시','Yeongcheon-si':'영천시','Sangju-si':'상주시','Mungyeong-si':'문경시','Gyeongsan-si':'경산시',
  'Uiseong-gun':'의성군','Cheongsong-gun':'청송군','Yeongyang-gun':'영양군','Yeongdeok-gun':'영덕군','Cheongdo-gun':'청도군',
  'Goryeong-gun':'고령군','Seongju-gun':'성주군','Chilgok-gun':'칠곡군','Yecheon-gun':'예천군','Bonghwa-gun':'봉화군',
  'Uljin-gun':'울진군','Ulleung-gun':'울릉군',
  // 경남 18
  'Changwon-si':'창원시','Jinju-si':'진주시','Tongyeong-si':'통영시','Sacheon-si':'사천시','Gimhae-si':'김해시',
  'Miryang-si':'밀양시','Geoje-si':'거제시','Yangsan-si':'양산시','Uiryeong-gun':'의령군','Haman-gun':'함안군',
  'Changnyeong-gun':'창녕군','Namhae-gun':'남해군','Hadong-gun':'하동군','Sancheong-gun':'산청군','Hamyang-gun':'함양군',
  'Geochang-gun':'거창군','Hapcheon-gun':'합천군','Goseong-gun (Gyeongnam)':'고성군',
  // 제주 2
  'Jeju-si':'제주시','Seogwipo-si':'서귀포시',
};

// ── 지오메트리 → res8 셀 목록 ──────────────────────────────────
function cellsOfFeature(geom) {
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
  const out = [];
  for (const coords of polys) {
    try {
      out.push(...polygonToCells(coords, RES, true)); // isGeoJson=true ([lng,lat])
    } catch (e) {
      console.warn('polyfill 실패(스킵 폴리곤):', e.message);
    }
  }
  return out;
}

function main() {
  const a1 = JSON.parse(fs.readFileSync(path.join(ROOT, 'geodata', 'KOR-ADM1.geojson'), 'utf8'));
  const a2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'geodata', 'KOR-ADM2.geojson'), 'utf8'));

  // LEVEL1: 폴리필 res6 룩업 (ADM2 → 소속 시/도 판정용)
  const level1 = [];
  const l1AtRes6 = new Map();
  for (const f of a1.features) {
    const en = f.properties.shapeName;
    const key = L1_KO[en];
    if (!key) throw new Error(`ADM1 한글 매핑 누락: ${en}`);
    const idx = level1.push({ key, en }) - 1;
    for (const c of cellsOfFeature(f.geometry)) {
      l1AtRes6.set(cellToParent(c, 6), idx);
    }
  }

  // LEVEL2: res8 전역 클레임(중복은 선착순) → 지역별 compact
  const level2 = [];
  const claim = new Map(); // res8 cell → l2 idx
  let dup = 0;
  const unmatched = new Set();
  for (const f of a2.features) {
    const en = f.properties.shapeName;
    // geoBoundaries 동명 구분용 대괄호 제거: 'Jung-gu [Central District]' → 'Jung-gu'
    const base = en.replace(/\s*\[.*\]\s*$/, '');
    const ko = L2_KO[en] ?? L2_KO[base];
    if (!ko) unmatched.add(en);
    const cells = cellsOfFeature(f.geometry);
    if (cells.length === 0) continue;
    // 소속 시/도: 구성 셀들의 res6 부모 다수결
    const vote = new Map();
    for (const c of cells) {
      const p = l1AtRes6.get(cellToParent(c, 6));
      if (p != null) vote.set(p, (vote.get(p) ?? 0) + 1);
    }
    const l1 = [...vote.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
    if (l1 == null) {
      console.warn(`⚠️ ${en}: 시/도 판정 실패 — 스킵`);
      continue;
    }
    const idx = level2.push({ name: ko ?? en, l1 }) - 1;
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
  if (unmatched.size) console.log(`   ❗ 한글 매핑 누락 ${unmatched.size}건: ${[...unmatched].join(', ')}`);
  // 검증 샘플
  const find = (n) => level2.findIndex((x) => x.name === n);
  for (const n of ['강남구', '송파구', '천안시', '서산시', '군위군']) {
    const i = find(n);
    console.log(`   ${n}: ${i >= 0 ? `${level1[level2[i].l1].key} 소속, ${l2Tiles[i].toLocaleString()} 타일` : '❌'}`);
  }
}

main();
