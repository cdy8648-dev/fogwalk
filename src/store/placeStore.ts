import { create } from 'zustand';

import { getAllPlaces } from '../services/db';
import { resolvePhotoUri } from '../services/photoFiles';
import type { Place } from '../types';

interface PlaceState {
  places: Place[];
  hydrate: () => void;
  add: (place: Place) => void;
  update: (place: Place) => void;
  remove: (id: string) => void;
}

export const usePlaceStore = create<PlaceState>((set) => ({
  places: [],
  // DB 저장값(파일명) → 현재 컨테이너 기준 URI로 재구성 (photoStore와 동일 규칙)
  hydrate: () =>
    set({
      places: getAllPlaces().map((p) =>
        p.photoUri ? { ...p, photoUri: resolvePhotoUri(p.photoUri) } : p
      ),
    }),
  add: (place) => set((state) => ({ places: [place, ...state.places] })),
  update: (place) =>
    set((state) => ({
      places: state.places.map((p) => (p.id === place.id ? place : p)),
    })),
  remove: (id) => set((state) => ({ places: state.places.filter((p) => p.id !== id) })),
}));
