import { useMapStore } from '../store/mapStore';
import { attributeTiles } from './country';
import { getProgress, insertVisitedTiles, updateProgress } from './db';
import { refreshProgressStore } from './progress';

/**
 * 잉크 소비 도메인. 잉크로 안개 타일을 밝힌다(연필 핀에서).
 * 밝힌 칸은 방문 타일로 영구 저장 + 여권/마일스톤에 카운트되지만
 * XP는 주지 않는다(잉크→XP 순환 방지). 적립은 progress.recordMovement.
 */
export function clearFogWithInk(tiles: string[], cost: number): 'ok' | 'no-ink' {
  const p = getProgress();
  if (p.ink < cost) return 'no-ink';

  const fresh = insertVisitedTiles(tiles);
  if (fresh.length > 0) {
    useMapStore.getState().addVisitedTiles(fresh); // fogVersion 증가 → 안개 즉시 갱신
    attributeTiles(fresh.length); // 여권(국가/시도/시구) 적립
  }
  updateProgress({ ink: p.ink - cost });
  refreshProgressStore(); // HUD 잉크 뱃지 갱신

  return 'ok';
}
