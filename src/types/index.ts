export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TrackingSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  distanceM: number;
  points: Coordinate[];
}

export interface VisitedTile {
  tileId: string;
  firstVisitedAt: number;
  visitCount: number;
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
  | 'monument'
  | 'park'
  | 'fountain'
  | 'temple'
  | 'museum'
  | 'historic'
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
