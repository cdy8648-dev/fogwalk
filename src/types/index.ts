export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Landmark {
  osmId: string;
  name: string; // OSM 원문 이름(현지어) — 폴백·매칭용 원본
  category: LandmarkCategory;
  lat: number;
  lng: number;
  discoveredAt?: number;
  rarity?: string;
  qid?: string; // OSM wikidata 태그 — 큐레이션(유네스코 뱃지·축하 문구) 조회 키
  displayName?: string; // 유저 언어 우선 표시 이름 (없으면 name 폴백)
  displayLang?: string; // displayName 의 언어 코드 ('ko'·'en'·'src'=원문)
}

export type LandmarkCategory =
  | 'tower'
  | 'palace'
  | 'temple'
  | 'monument'
  | 'historic'
  | 'museum'
  | 'park'
  | 'peak'
  | 'attraction'
  | 'bridge'
  | 'subway'
  | 'airport'
  | 'train'
  | 'port'
  | 'other';

export interface Achievement {
  id: string;
  type: AchievementType;
  value: string;
  unlockedAt: number;
}

export type AchievementType =
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'dist_1km'
  | 'dist_5km'
  | 'dist_10km'
  | 'tiles_100'
  | 'tiles_500'
  | 'landmark_first'
  | 'landmark_10'
  | 'area_100';

export interface DailyStats {
  date: string;
  distanceM: number;
  newTiles: number;
}

export interface Photo {
  id: string;
  lat: number;
  lng: number;
  uri: string;
  caption?: string;
  createdAt: number;
}

export interface CountryStat {
  code: string; // ISO 2글자 (예: 'KR')
  name: string;
  tiles: number;
  firstVisitedAt: number;
}

export interface RegionStat {
  region: string; // 시/도 (예: 서울특별시)
  tiles: number;
  firstVisitedAt: number;
}
