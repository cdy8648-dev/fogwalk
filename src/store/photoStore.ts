import { create } from 'zustand';

import { getAllPhotos } from '../services/db';
import { resolvePhotoUri } from '../services/photoFiles';
import type { Photo } from '../types';

interface PhotoState {
  photos: Photo[];
  hydrate: () => void;
  add: (photo: Photo) => void;
  remove: (id: string) => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  // DB 저장값(파일명/구버전 절대경로) → 현재 컨테이너 기준 URI로 재구성
  hydrate: () =>
    set({ photos: getAllPhotos().map((p) => ({ ...p, uri: resolvePhotoUri(p.uri) })) }),
  add: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  remove: (id) => set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
}));
