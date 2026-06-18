import { create } from 'zustand';

import { DEFAULT_MAP_STYLE_ID } from '../constants/mapStyles';
import { getSetting, setSetting } from '../services/db';

const KEY_MAP_STYLE = 'mapStyleId';

interface SettingsState {
  mapStyleId: string;
  hydrate: () => void;
  setMapStyle: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mapStyleId: DEFAULT_MAP_STYLE_ID,
  hydrate: () =>
    set({ mapStyleId: getSetting(KEY_MAP_STYLE) ?? DEFAULT_MAP_STYLE_ID }),
  setMapStyle: (id) => {
    setSetting(KEY_MAP_STYLE, id); // 영속
    set({ mapStyleId: id });
  },
}));
