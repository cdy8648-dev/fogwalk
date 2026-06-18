import type { LandmarkCategory } from '../types';

export const CATEGORY_EMOJI: Record<LandmarkCategory, string> = {
  tower: '🗼',
  monument: '🗿',
  park: '🌳',
  fountain: '⛲',
  temple: '⛩️',
  museum: '🏛️',
  historic: '🏯',
  peak: '⛰️',
  other: '📍',
};

export function rarityLabel(rarity?: string): string {
  if (rarity === 'legendary') return '⭐ 전설';
  if (rarity === 'rare') return '✦ 희귀';
  return '일반';
}
