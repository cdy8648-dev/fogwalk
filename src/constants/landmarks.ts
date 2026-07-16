import { COLORS } from './colors';
import { CONFIG } from './config';
import type { DiscoveryGroup, Landmark, LandmarkCategory } from '../types';

export const CATEGORY_EMOJI: Record<LandmarkCategory, string> = {
  tower: '🗼',
  palace: '🏯',
  temple: '⛩️',
  monument: '🗿',
  historic: '🏛️',
  museum: '🖼️',
  park: '🌳',
  peak: '⛰️',
  attraction: '📸',
  bridge: '🌉',
  subway: '🚇',
  airport: '✈️',
  train: '🚄',
  port: '⛴️',
  other: '📍',
};

export const CATEGORY_LABEL: Record<LandmarkCategory, string> = {
  tower: '타워',
  palace: '궁궐',
  temple: '사찰',
  monument: '기념물',
  historic: '유적',
  museum: '박물관',
  park: '공원',
  peak: '봉우리',
  attraction: '명소',
  bridge: '다리',
  subway: '지하철',
  airport: '공항',
  train: '기차역',
  port: '항구',
  other: '장소',
};

// ── 발견 상위 4대분류 (건축·문화 / 자연 / 교통 / 기타) ──────────────
// 15개 세부 카테고리를 4그룹으로. 필터 칩·발견 타일이 이 매핑을 단일 소스로 쓴다.
// (bridge/tower 등 다리·타워는 '문화 랜드마크'로 취급 — 교통이 아니라 건축물 관점)
export const CATEGORY_GROUP: Record<LandmarkCategory, DiscoveryGroup> = {
  tower: 'culture',
  palace: 'culture',
  temple: 'culture',
  monument: 'culture',
  historic: 'culture',
  museum: 'culture',
  attraction: 'culture',
  bridge: 'culture',
  park: 'nature',
  peak: 'nature',
  subway: 'transport',
  airport: 'transport',
  train: 'transport',
  port: 'transport',
  other: 'etc',
};

export const GROUP_LABEL: Record<DiscoveryGroup, string> = {
  culture: '건축·문화',
  nature: '자연',
  transport: '교통',
  etc: '기타',
};

/** 발견 타일/필터 순서 (전체 제외한 4그룹). */
export const DISCOVERY_GROUPS: DiscoveryGroup[] = ['culture', 'nature', 'transport', 'etc'];

/** 표시 이름 — 유저 언어 우선(displayName), 없으면 OSM 원문(name) 폴백. 모든 UI가 이걸 쓴다. */
export function landmarkDisplayName(lm: Landmark): string {
  return lm.displayName || lm.name;
}

/** 발견 XP (마스터 시트): 지하철=도감 트랙 0XP, 그 외 등급별. */
export function landmarkXp(lm: Landmark): number {
  if (lm.category === 'subway') return CONFIG.XP_SUBWAY;
  if (lm.rarity === 'legendary') return CONFIG.XP_LANDMARK_LEGENDARY;
  if (lm.rarity === 'epic') return CONFIG.XP_LANDMARK_EPIC;
  if (lm.rarity === 'rare') return CONFIG.XP_LANDMARK_RARE;
  return CONFIG.XP_LANDMARK_COMMON;
}

export function rarityLabel(rarity?: string): string {
  if (rarity === 'legendary') return '⭐ 전설';
  if (rarity === 'epic') return '◆ 영웅';
  if (rarity === 'rare') return '✦ 희귀';
  return '일반';
}

/** 희귀도별 색 (마스터 시트 별빛 규칙): 전설=골드 / 영웅=바이올렛 / 희귀=틸 / 일반=흰 점. */
export function rarityColor(rarity?: string): string {
  if (rarity === 'legendary') return COLORS.gold;
  if (rarity === 'epic') return COLORS.violet;
  if (rarity === 'rare') return COLORS.teal;
  return 'rgba(255,255,255,0.75)';
}
