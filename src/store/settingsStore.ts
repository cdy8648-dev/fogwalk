import { create } from 'zustand';

import {
  DEFAULT_MAP_STYLE_MODE,
  normalizeMapStyleMode,
  type MapStyleMode,
} from '../constants/mapStyles';
import { getSetting, setSetting } from '../services/db';

const KEY_MAP_STYLE = 'mapStyleMode';

interface SettingsState {
  mapStyleMode: MapStyleMode; // 'explore'(기본) | 'detail'
  hydrate: () => void;
  setMapStyle: (mode: MapStyleMode) => void;
  toggleMapStyle: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  mapStyleMode: DEFAULT_MAP_STYLE_MODE,
  hydrate: () => set({ mapStyleMode: normalizeMapStyleMode(getSetting(KEY_MAP_STYLE)) }),
  setMapStyle: (mode) => {
    setSetting(KEY_MAP_STYLE, mode); // 영속(SQLite) → 재시작 후에도 유지
    set({ mapStyleMode: mode });
  },
  toggleMapStyle: () => {
    const next: MapStyleMode = get().mapStyleMode === 'explore' ? 'detail' : 'explore';
    setSetting(KEY_MAP_STYLE, next); // 영속
    set({ mapStyleMode: next });
  },
}));
