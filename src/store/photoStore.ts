import { create } from 'zustand';

import { getAllPhotos } from '../services/db';
import type { Photo } from '../types';

interface PhotoState {
  photos: Photo[];
  hydrate: () => void;
  add: (photo: Photo) => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  hydrate: () => set({ photos: getAllPhotos() }),
  add: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
}));
