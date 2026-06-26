import { ACHIEVEMENTS } from '../constants/achievements';
import { useAchievementStore } from '../store/achievementStore';
import { useMapStore } from '../store/mapStore';
import type { Achievement } from '../types';
import { getProgress, insertAchievement } from './db';

/**
 * 현재 지표를 보고 새로 달성한 뱃지를 해금(DB + 스토어 + 축하 큐).
 * 진행도 갱신 때마다 호출. 이미 해금된 것은 건너뛴다.
 */
export function checkAchievements(): void {
  const store = useAchievementStore.getState();
  const p = getProgress();
  const metrics: Record<'streak' | 'distanceKm' | 'tiles', number> = {
    streak: p.streak,
    distanceKm: p.totalDistanceM / 1000,
    tiles: useMapStore.getState().visitedTileIds.size, // 메모리 캐시(매 측위 COUNT(*) 회피)
  };
  const now = Date.now();

  for (const def of ACHIEVEMENTS) {
    if (store.unlockedTypes.has(def.type)) continue;
    if (metrics[def.metric] >= def.threshold) {
      const achievement: Achievement = {
        id: def.type,
        type: def.type,
        value: String(def.threshold),
        unlockedAt: now,
      };
      // DB에 "실제로 새로" 들어갔을 때만 축하 — hydrate 안 된 컨텍스트(백그라운드 재실행)
      // 에서 이미 받은 뱃지를 다시 토스트로 띄우는 것 방지.
      const isNew = insertAchievement(achievement);
      store.markUnlocked(def.type);
      if (isNew) {
        store.celebrate({ emoji: def.emoji, title: '뱃지 획득!', subtitle: def.label });
      }
    }
  }
}
