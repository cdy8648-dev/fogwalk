import { create } from 'zustand';

import { getAllVisitedTileIds } from '../services/db';
import type { Coordinate } from '../types';

interface MapState {
  visitedTileIds: Set<string>;
  currentLocation: Coordinate | null;
  fogVersion: number; // 렌더 무효화용 카운터

  hydrate: () => void;
  setLocation: (c: Coordinate) => void;
  addVisitedTiles: (ids: string[]) => void;
}

export const useMapStore = create<MapState>((set) => ({
  visitedTileIds: new Set<string>(),
  currentLocation: null,
  fogVersion: 0,

  // 앱 시작 시 DB → Set 복원
  hydrate: () =>
    set((state) => ({
      visitedTileIds: new Set(getAllVisitedTileIds()),
      fogVersion: state.fogVersion + 1,
    })),

  setLocation: (c) => set({ currentLocation: c }),

  addVisitedTiles: (ids) =>
    set((state) => {
      let changed = false;
      const next = new Set(state.visitedTileIds);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return state;
      return { visitedTileIds: next, fogVersion: state.fogVersion + 1 };
    }),
}));
