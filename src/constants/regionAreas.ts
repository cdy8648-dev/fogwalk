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

/** 시/도 수 — 여권 '남은 지역' 계산용. */
export const KR_REGION_COUNT = 17;

/** 시/도 영문명 (여권 미니 스탬프/MRZ 용). */
const KR_REGION_EN: Record<string, string> = {
  서울: 'SEOUL',
  부산: 'BUSAN',
  대구: 'DAEGU',
  인천: 'INCHEON',
  광주: 'GWANGJU',
  대전: 'DAEJEON',
  울산: 'ULSAN',
  세종: 'SEJONG',
  경기: 'GYEONGGI',
  강원: 'GANGWON',
  충북: 'CHUNGBUK',
  충남: 'CHUNGNAM',
  전북: 'JEONBUK',
  전남: 'JEONNAM',
  경북: 'GYEONGBUK',
  경남: 'GYEONGNAM',
  제주: 'JEJU',
};

/** 시/도 영문명. 한국 외/미상은 null. */
export function regionEnName(countryCode: string, region: string): string | null {
  if (countryCode !== 'KR') return null;
  const key = normalizeRegion(region);
  return key ? KR_REGION_EN[key] ?? null : null;
}

/** 시/도 대표 좌표(도청/시청 인근) — '가장 가까운 새 지역' 티저 계산용. */
export const KR_REGION_CENTER: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 },
  부산: { lat: 35.1796, lng: 129.0756 },
  대구: { lat: 35.8714, lng: 128.6014 },
  인천: { lat: 37.4563, lng: 126.7052 },
  광주: { lat: 35.1595, lng: 126.8526 },
  대전: { lat: 36.3504, lng: 127.3845 },
  울산: { lat: 35.5384, lng: 129.3114 },
  세종: { lat: 36.48, lng: 127.289 },
  경기: { lat: 37.2636, lng: 127.0286 },
  강원: { lat: 37.8813, lng: 127.7298 },
  충북: { lat: 36.6424, lng: 127.489 },
  충남: { lat: 36.6588, lng: 126.6728 },
  전북: { lat: 35.8242, lng: 127.148 },
  전남: { lat: 34.8161, lng: 126.4629 },
  경북: { lat: 36.5684, lng: 128.7294 },
  경남: { lat: 35.2281, lng: 128.6811 },
  제주: { lat: 33.4996, lng: 126.5312 },
};

/** 표기 흔들리는 시/도명 → 핵심 키 (예: '전북특별자치도' → '전북'). 미상은 null. */
export function regionKey(region: string): string | null {
  return normalizeRegion(region);
}
