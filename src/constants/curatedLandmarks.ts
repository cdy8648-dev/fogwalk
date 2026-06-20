// 큐레이션: 좌표·수집은 OSM에 맡기고, "이름"으로 희귀도만 부스트한다.
// (정확한 wikidata QID 없이도 국가 상징급을 전설로 보장)

function norm(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}

// ⭐ 전설(국가 상징급) — 별칭 포함.
const LEGENDARY = [
  '경복궁',
  '창덕궁',
  '종묘',
  '숭례문',
  '남대문',
  '동대문디자인플라자',
  'ddp',
  '수원화성',
  '화성행궁',
  '불국사',
  '석굴암',
  '첨성대',
  '하회마을',
  '안동하회마을',
  '해인사',
  'n서울타워',
  '남산서울타워',
  '서울타워',
  '롯데월드타워',
  '광안대교',
  '한라산',
  '성산일출봉',
].map(norm);
const LEGENDARY_NAMES = new Set(LEGENDARY);

// 환승 거점 지하철역(역명에서 '역' 접미사 제거 후 매칭) → 희귀.
const HUBS = [
  '서울',
  '강남',
  '잠실',
  '사당',
  '신도림',
  '동대문역사문화공원',
  '고속터미널',
  '왕십리',
  '합정',
  '건대입구',
  '디지털미디어시티',
  '가산디지털단지',
  '시청',
  '연신내',
  '수원',
  '서면',
  '부산',
  '동대구',
  '대전',
  '반월당',
].map(norm);
const SUBWAY_HUBS = new Set(HUBS);

/** 국가 상징급 랜드마크 이름인가 (전설 부스트). */
export function isLegendaryName(name: string): boolean {
  return LEGENDARY_NAMES.has(norm(name));
}

/** 환승 거점 지하철역인가 (희귀 부스트). */
export function isSubwayHub(name: string): boolean {
  return SUBWAY_HUBS.has(norm(name.replace(/역$/, '')));
}
