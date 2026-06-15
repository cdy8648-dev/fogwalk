import { create } from 'zustand';

import type { Coordinate } from '../types';

interface MapState {
  visitedTileIds: Set<string>;
  currentLocation: Coordinate | null;
  activeSessionId: string | null;
  isTracking: boolean;

  setLocation: (location: Coordinate) => void;
  startSession: (sessionId: string) => void;
  endSession: () => void;
  addVisitedTile: (tileId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  visitedTileIds: new Set<string>(),
  currentLocation: null,
  activeSessionId: null,
  isTracking: false,

  setLocation: (location) => set({ currentLocation: location }),
  startSession: (sessionId) =>
    set({ activeSessionId: sessionId, isTracking: true }),
  endSession: () => set({ activeSessionId: null, isTracking: false }),
  addVisitedTile: (tileId) =>
    set((state) => {
      if (state.visitedTileIds.has(tileId)) return state;
      const next = new Set(state.visitedTileIds);
      next.add(tileId);
      return { visitedTileIds: next };
    }),
}));
