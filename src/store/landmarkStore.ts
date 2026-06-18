import { create } from 'zustand';

import { getDiscoveredLandmarks } from '../services/db';
import type { Landmark } from '../types';

interface LandmarkState {
  discovered: Landmark[];
  hydrate: () => void;
  add: (lm: Landmark) => void;
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
}));
