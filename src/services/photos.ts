import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { usePhotoStore } from '../store/photoStore';
import { insertPhoto } from './db';
import { photoDir } from './photoFiles';

export type CaptureResult = 'ok' | 'no-permission' | 'canceled' | 'error';

/**
 * 현재 위치에 사진 촬영 → 영속 저장 → photos 행.
 * expo-image-picker(촬영) + expo-file-system 신규 API(영속 복사) 사용.
 */
export async function capturePhotoAt(
  lat: number,
  lng: number
): Promise<CaptureResult> {
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

    const dir = photoDir();
    if (!dir.exists) dir.create();
    const fileName = `${id}.${ext}`;
    const dest = new File(dir, fileName);
    new File(asset.uri).copy(dest);

    const createdAt = Date.now();
    // DB엔 파일명만 저장(컨테이너 경로 변경에도 안전). 화면 스토어엔 현재 절대경로.
    insertPhoto({ id, lat, lng, uri: fileName, createdAt });
    usePhotoStore.getState().add({ id, lat, lng, uri: dest.uri, createdAt });
    return 'ok';
  } catch (e) {
    console.warn('[photos] capture failed:', e);
    return 'error';
  }
}
