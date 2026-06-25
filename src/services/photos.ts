import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { usePhotoStore } from '../store/photoStore';
import { getProgress, insertPhoto } from './db';
import { photoDir } from './photoFiles';
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

    const dir = photoDir();
    if (!dir.exists) dir.create();
    const fileName = `${id}.${ext}`;
    const dest = new File(dir, fileName);
    new File(asset.uri).copy(dest);

    const createdAt = Date.now();
    // DB엔 파일명만 저장(컨테이너 경로 변경에도 안전). 화면 스토어엔 현재 절대경로.
    insertPhoto({ id, lat, lng, uri: fileName, createdAt });
    usePhotoStore.getState().add({ id, lat, lng, uri: dest.uri, createdAt });

    // 필름 차감은 저장이 끝난 뒤에 — 복사/저장이 실패하면 필름을 잃지 않도록.
    // (상단에서 film>=1 확인했고, 필름은 게시 외엔 줄 일이 없어 사실상 항상 성공)
    trySpendFilm();
    return 'ok';
  } catch (e) {
    console.warn('[photos] capture failed:', e);
    return 'error';
  }
}
