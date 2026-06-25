export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Landmark {
  osmId: string;
  name: string;
  category: LandmarkCategory;
  lat: number;
  lng: number;
  discoveredAt?: number;
  rarity?: string;
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
