import { create } from 'zustand';

import { getDiscoveredLandmarks } from '../services/db';
import type { Landmark } from '../types';

interface LandmarkState {
  discovered: Landmark[];
  hydrate: () => void;
  add: (lm: Landmark) => void;
  updateDisplayName: (osmId: string, displayName: string, displayLang: string) => void;
}

export const useLandmarkStore = create<LandmarkState>((set) => ({
  discovered: [],
  hydrate: () => set({ discovered: getDiscoveredLandmarks() }),
  add: (lm) =>
    set((state) =>
      state.discovered.some((x) => x.osmId === lm.osmId)
        ? state
        : { discovered: [lm, ...state.discovered] }
    ),
  updateDisplayName: (osmId, displayName, displayLang) =>
    set((state) => ({
      discovered: state.discovered.map((x) =>
        x.osmId === osmId ? { ...x, displayName, displayLang } : x
      ),
    })),
}));
