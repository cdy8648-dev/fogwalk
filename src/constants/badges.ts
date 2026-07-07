/**
 * 뱃지(업적) 카탈로그 — 데이터로 관리. 새 뱃지 추가 = 여기에 항목 하나 + (필요 시) BadgeMetricKey 확장.
 * 판정 로직은 services/badges.ts 가 metric 키로 현재값을 읽어 threshold 와 비교한다(하드코딩 금지).
 * 아이콘은 assets/badges/<icon>.svg (id 네임스페이스된 문자열은 badgeSvgs.ts).
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold';

// 진열장 섹션(축). 표시 순서 = AXIS_ORDER.
export type BadgeAxis = 'first' | 'distance' | 'streak' | 'discover' | 'collection' | 'area';

// 현재값을 읽어올 지표 키. 'cat:*' 는 카테고리별 발견 수.
export type BadgeMetricKey =
  | 'tiles'
  | 'distanceKm'
  | 'streak'
  | 'photos'
  | 'discovered'
  | 'legendary'
  | 'unesco'
  | 'seoulTiles'
  | 'cat:palace'
  | 'cat:temple';

export interface BadgeDef {
  id: string; // achievements.type 와 동일 (기존 unlock 보존 위해 streak_*/dist_1km/5km 유지)
  name: string;
  axis: BadgeAxis;
  tier: BadgeTier;
  icon: string; // badgeSvgs.ts 키 (assets/badges 파일명)
  metric: BadgeMetricKey;
  threshold: number;
  unit: string; // 진행도 표기 단위 ('km'·'개'·'칸'·'일')
  condition: string; // 사람이 읽는 조건
  celebrationText: string; // 획득 축하 문구
  xpReward: number; // 0이면 없음
  hidden?: boolean; // 획득 전 '???'
}

export const AXIS_LABEL: Record<BadgeAxis, string> = {
  first: '최초의 순간들',
  distance: '거리',
  streak: '연속 탐험 🔥',
  discover: '발견',
  collection: '컬렉션',
  area: '지역 정복',
};

export const AXIS_ORDER: BadgeAxis[] = ['first', 'distance', 'streak', 'discover', 'collection', 'area'];

// 진행도 바 채움 색(획득 전 수치형 진행 표시). 티어색과 별개의 은은한 라임.
export const BADGES: BadgeDef[] = [
  // ── 최초의 순간들 ──────────────────────────────────────────
  { id: 'first_fog', name: '첫 발자국', axis: 'first', tier: 'bronze', icon: '01-first-step',
    metric: 'tiles', threshold: 1, unit: '칸', condition: '첫 안개 걷기',
    celebrationText: '탐험의 첫 걸음을 내디뎠어요!', xpReward: 0 },
  { id: 'first_discover', name: '첫 발견', axis: 'first', tier: 'bronze', icon: '02-first-find',
    metric: 'discovered', threshold: 1, unit: '개', condition: '첫 랜드마크 발견',
    celebrationText: '세상에 숨은 첫 별을 찾았어요', xpReward: 50 },
  { id: 'first_photo', name: '첫 기록', axis: 'first', tier: 'bronze', icon: '03-first-record',
    metric: 'photos', threshold: 1, unit: '장', condition: '첫 사진 남기기',
    celebrationText: '탐험의 순간을 지도에 새겼어요', xpReward: 0 },
  { id: 'first_legendary', name: '첫 전설', axis: 'first', tier: 'gold', icon: '04-first-legend',
    metric: 'legendary', threshold: 1, unit: '개', condition: '첫 전설 랜드마크 발견',
    celebrationText: '전설이 당신 앞에 모습을 드러냈습니다', xpReward: 100 },

  // ── 거리 ───────────────────────────────────────────────────
  { id: 'dist_1km', name: '산책러', axis: 'distance', tier: 'bronze', icon: '05-stroller',
    metric: 'distanceKm', threshold: 1, unit: 'km', condition: '누적 1km 걷기',
    celebrationText: '첫 1km를 채웠어요', xpReward: 0 },
  { id: 'dist_5km', name: '걷는 사람', axis: 'distance', tier: 'bronze', icon: '06-walker',
    metric: 'distanceKm', threshold: 5, unit: 'km', condition: '누적 5km 걷기',
    celebrationText: '5km, 이제 몸이 풀렸어요', xpReward: 50 },
  { id: 'dist_20km', name: '종주자', axis: 'distance', tier: 'silver', icon: '07-trekker',
    metric: 'distanceKm', threshold: 20, unit: 'km', condition: '누적 20km 걷기',
    celebrationText: '20km, 웬만한 산 하나를 넘었어요', xpReward: 100 },
  { id: 'dist_50km', name: '대륙 횡단', axis: 'distance', tier: 'silver', icon: '08-crosser',
    metric: 'distanceKm', threshold: 50, unit: 'km', condition: '누적 50km 걷기',
    celebrationText: '50km, 도시를 가로질렀어요', xpReward: 150 },
  { id: 'dist_100km', name: '지구를 걷는 자', axis: 'distance', tier: 'gold', icon: '09-earth-walker',
    metric: 'distanceKm', threshold: 100, unit: 'km', condition: '누적 100km 걷기',
    celebrationText: '100km, 당신의 발자국이 지도를 덮었어요', xpReward: 250 },

  // ── 연속 탐험 ──────────────────────────────────────────────
  { id: 'streak_3', name: '3일 연속', axis: 'streak', tier: 'bronze', icon: '10-streak-3',
    metric: 'streak', threshold: 3, unit: '일', condition: '3일 연속 탐험',
    celebrationText: '사흘째, 습관이 되어가요', xpReward: 50 },
  { id: 'streak_7', name: '7일 연속', axis: 'streak', tier: 'silver', icon: '11-streak-7',
    metric: 'streak', threshold: 7, unit: '일', condition: '7일 연속 탐험',
    celebrationText: '일주일을 채웠어요!', xpReward: 100 },
  { id: 'streak_30', name: '30일 연속', axis: 'streak', tier: 'gold', icon: '12-streak-30',
    metric: 'streak', threshold: 30, unit: '일', condition: '30일 연속 탐험',
    celebrationText: '한 달 개근, 진짜 탐험가예요', xpReward: 250 },
  { id: 'streak_100', name: '백일의 탐험가', axis: 'streak', tier: 'gold', icon: '13-streak-100',
    metric: 'streak', threshold: 100, unit: '일', condition: '100일 연속 탐험',
    celebrationText: '백일, 전설의 반열에 올랐어요', xpReward: 500 },

  // ── 발견 (총 발견 수) ──────────────────────────────────────
  { id: 'discover_10', name: '수집가', axis: 'discover', tier: 'bronze', icon: '14-collector-1',
    metric: 'discovered', threshold: 10, unit: '개', condition: '랜드마크 10개 발견',
    celebrationText: '열 개의 별을 모았어요', xpReward: 50 },
  { id: 'discover_50', name: '탐구가', axis: 'discover', tier: 'silver', icon: '15-collector-2',
    metric: 'discovered', threshold: 50, unit: '개', condition: '랜드마크 50개 발견',
    celebrationText: '쉰 개, 도감이 채워지고 있어요', xpReward: 150 },
  { id: 'discover_100', name: '도감 마스터', axis: 'discover', tier: 'gold', icon: '16-collector-3',
    metric: 'discovered', threshold: 100, unit: '개', condition: '랜드마크 100개 발견',
    celebrationText: '백 개의 발견, 걸어다니는 도감이에요', xpReward: 300 },

  // ── 컬렉션 (카테고리·유네스코) ─────────────────────────────
  { id: 'palace_5', name: '궁궐 순례자', axis: 'collection', tier: 'silver', icon: '17-palace',
    metric: 'cat:palace', threshold: 5, unit: '개', condition: '궁궐 5곳 발견',
    celebrationText: '다섯 궁을 모두 거닐었어요', xpReward: 100 },
  { id: 'temple_5', name: '산사의 벗', axis: 'collection', tier: 'silver', icon: '18-temple',
    metric: 'cat:temple', threshold: 5, unit: '개', condition: '사찰 5곳 발견',
    celebrationText: '다섯 산사의 종소리를 들었어요', xpReward: 100 },
  { id: 'unesco_3', name: '유네스코 헌터', axis: 'collection', tier: 'gold', icon: '19-unesco',
    metric: 'unesco', threshold: 3, unit: '개', condition: '유네스코 세계유산 3곳 발견',
    celebrationText: '인류의 유산 셋을 찾아냈어요', xpReward: 200 },

  // ── 지역 정복 ──────────────────────────────────────────────
  { id: 'seoul_master', name: '서울 마스터', axis: 'area', tier: 'gold', icon: '20-seoul-master',
    metric: 'seoulTiles', threshold: 300, unit: '칸', condition: '서울에서 300칸 밝히기',
    celebrationText: '서울을 손바닥처럼 훤히 알게 됐어요', xpReward: 300 },
];

/** 티어별 강조 색 (테두리·글로우). */
export const TIER_COLOR: Record<BadgeTier, string> = {
  bronze: '#C98D5A',
  silver: '#B9C0D0',
  gold: '#E0A458',
};
