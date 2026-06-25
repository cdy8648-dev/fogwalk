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
  other: '📍',
};

export function rarityLabel(rarity?: string): string {
  if (rarity === 'legendary') return '⭐ 전설';
  if (rarity === 'rare') return '✦ 희귀';
  return '일반';
}

/** 희귀도별 마커 색: 일반=보라 / 희귀=핫핑크 / 전설=앰버. */
export function rarityColor(rarity?: string): string {
  if (rarity === 'legendary') return COLORS.amber;
  if (rarity === 'rare') return COLORS.hotpink;
  return COLORS.violet;
}
