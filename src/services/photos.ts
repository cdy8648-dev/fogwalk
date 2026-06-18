import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';
import { getProgress, insertPhoto } from './db';
import { trySpendFilm } from './progress';

export type CaptureResult =
  | 'ok'
  | 'no-film'
  | 'no-permission'
  | 'canceled'
  | 'error';

/**
 * 현재 위치에 사진 촬영 → 영속 저장 → photos 행 + 필름 1 차감.
 * expo-image-picker(촬영) + expo-file-system 신규 API(영속 복사) 사용.
 */
export async function capturePhotoAt(
  lat: number,
  lng: number
): Promise<CaptureResult> {
  if (getProgress().film < 1) return 'no-film';

  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return 'no-permission';

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets || result.assets.length === 0) {
    return 'canceled';
  }

  try {
    const asset = result.assets[0];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = (asset.uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();

    const dir = new Directory(Paths.document, 'photos');
    if (!dir.exists) dir.create();
    const dest = new File(dir, `${id}.${ext}`);
    new File(asset.uri).copy(dest);

    if (!trySpendFilm()) return 'no-film'; // 동시성 안전장치

    const photo: Photo = {
      id,
      lat,
      lng,
      uri: dest.uri,
      createdAt: Date.now(),
    };
    insertPhoto(photo);
    usePhotoStore.getState().add(photo);
    return 'ok';
  } catch (e) {
    console.warn('[photos] capture failed:', e);
    return 'error';
  }
}
