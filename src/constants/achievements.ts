import type { AchievementType } from '../types';

export interface AchievementDef {
  type: AchievementType;
  label: string;
  emoji: string;
  metric: 'streak' | 'distanceKm' | 'tiles';
  threshold: number;
}

/**
 * 뱃지 카탈로그. 현재 쌓는 지표(스트릭·총거리·타일)로 즉시 체크 가능한 것만.
 * landmark_*, area_100 은 Phase 3(랜드마크)에서 추가.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  { type: 'streak_3', label: '3일 연속 탐험', emoji: '🔥', metric: 'streak', threshold: 3 },
  { type: 'streak_7', label: '7일 연속 탐험', emoji: '🔥', metric: 'streak', threshold: 7 },
  { type: 'streak_30', label: '30일 연속 탐험', emoji: '🏆', metric: 'streak', threshold: 30 },
  { type: 'dist_1km', label: '1km 걷기', emoji: '👟', metric: 'distanceKm', threshold: 1 },
  { type: 'dist_5km', label: '5km 걷기', emoji: '👟', metric: 'distanceKm', threshold: 5 },
  { type: 'dist_10km', label: '10km 걷기', emoji: '🥾', metric: 'distanceKm', threshold: 10 },
  { type: 'tiles_100', label: '100칸 밝히기', emoji: '🗺️', metric: 'tiles', threshold: 100 },
  { type: 'tiles_500', label: '500칸 밝히기', emoji: '🗺️', metric: 'tiles', threshold: 500 },
];
