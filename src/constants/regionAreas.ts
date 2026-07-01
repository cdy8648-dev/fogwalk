/**
 * 시/도 권역 면적(km²) — 달성률(%) 계산용. 한국(KR)만 큐레이션.
 *
 * region 문자열은 iOS reverseGeocode 의 administrativeArea 라서
 * "서울특별시" / "강원특별자치도" / "전북특별자치도" 처럼 표기가 흔들린다.
 * → 핵심 토큰으로 정규화(normalizeRegion)해 면적을 찾는다.
 * 다른 나라는 면적 테이블이 없어 달성률 대신 밝힌 칸 수만 보여준다(count-only fallback).
 *
 * 면적 출처: 행정안전부 기준 대략값(2024). 군위군 편입 반영(대구↑/경북↓).
 */
const KR_REGION_AREA_KM2: Record<string, number> = {
  서울: 605,
  부산: 770,
  대구: 1499,
  인천: 1067,
  광주: 501,
  대전: 539,
  울산: 1062,
  세종: 465,
  경기: 10199,
  강원: 16826,
  충북: 7407,
  충남: 8246,
  전북: 8073,
  전남: 12348,
  경북: 18424,
  경남: 10540,
  제주: 1850,
};

/** 한국 전체 육지 면적(km²) — 국가 달성률용. */
export const KR_TOTAL_AREA_KM2 = Object.values(KR_REGION_AREA_KM2).reduce(
  (a, b) => a + b,
  0
);

// 표기 변형 → 핵심 키. 더 긴/구체적인 패턴을 먼저 둔다(충청북 → 충북).
const NORMALIZE: [string, string][] = [
  ['서울', '서울'],
  ['부산', '부산'],
  ['대구', '대구'],
  ['인천', '인천'],
  ['광주', '광주'],
  ['대전', '대전'],
  ['울산', '울산'],
  ['세종', '세종'],
  ['경기', '경기'],
  ['강원', '강원'],
  ['충청북', '충북'],
  ['충북', '충북'],
  ['충청남', '충남'],
  ['충남', '충남'],
  ['전라북', '전북'],
  ['전북', '전북'],
  ['전라남', '전남'],
  ['전남', '전남'],
  ['경상북', '경북'],
  ['경북', '경북'],
  ['경상남', '경남'],
  ['경남', '경남'],
  ['제주', '제주'],
];

function normalizeRegion(region: string): string | null {
  for (const [pattern, key] of NORMALIZE) {
    if (region.includes(pattern)) return key;
  }
  return null;
}

/** 권역 면적(km²). 한국 시/도만 값이 있고, 그 외엔 null. */
export function regionAreaKm2(countryCode: string, region: string): number | null {
  if (countryCode !== 'KR') return null;
  const key = normalizeRegion(region);
  return key ? KR_REGION_AREA_KM2[key] ?? null : null;
}
