import { COLORS } from './colors';
import type { LandmarkCategory } from '../types';

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
