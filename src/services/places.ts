import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { CONFIG } from '../constants/config';
import { usePlaceStore } from '../store/placeStore';
import type { Place } from '../types';
import { deletePlaceRow, getProgress, insertPlace, updatePlaceRow, updateProgress } from './db';
import { reverseAddress } from './gps';
import { deletePhotoFile, photoDir, resolvePhotoUri } from './photoFiles';
import { refreshProgressStore } from './progress';

/**
 * 나만의 장소 도메인 — 잉크를 소비해 밝힌 땅에 개인 라벨을 남긴다.
 * 생성만 잉크 차감(INK_COST_PLACE), 수정·이동·삭제는 무료(환불 없음).
 * 사진 파일은 photos 디렉터리를 공유하되 'place-' 접두사로 구분.
 */

export interface PlaceDraft {
  emoji: string;
  name: string;
  memo?: string;
  photoUri?: string | null; // 피커가 준 임시 URI (영속 복사는 여기서)
}

/** 카메라/앨범에서 장소 사진 선택. 취소/거부 시 null. */
export async function pickPlacePhoto(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
  }
  const opts: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.6,
    allowsEditing: false,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

// 임시 URI → photos 디렉터리에 영속 복사. 반환값 = 저장 파일명(DB용).
// 파일명에 타임스탬프 포함 — 같은 URI 덮어쓰기 시 RN Image 캐시가 이전 사진을 보여주는 것 방지.
function persistPhoto(tempUri: string, placeId: string): string {
  const ext = (tempUri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const dir = photoDir();
  if (!dir.exists) dir.create();
  const fileName = `place-${placeId}-${Date.now()}.${ext}`;
  new File(tempUri).copy(new File(dir, fileName));
  return fileName;
}

/** 장소 생성 — 잉크 차감 + 역지오코딩 + 사진 영속화 + DB/스토어. */
export async function createPlace(
  lat: number,
  lng: number,
  draft: PlaceDraft
): Promise<'ok' | 'no-ink' | 'error'> {
  const p = getProgress();
  if (p.ink < CONFIG.INK_COST_PLACE) return 'no-ink';

  try {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fileName = draft.photoUri ? persistPhoto(draft.photoUri, id) : undefined;
    const address = (await reverseAddress(lat, lng)) ?? undefined;

    const place: Place = {
      id,
      lat,
      lng,
      emoji: draft.emoji,
      name: draft.name.trim(),
      memo: draft.memo?.trim() || undefined,
      address,
      photoUri: fileName,
      createdAt: Date.now(),
    };
    insertPlace(place);
    usePlaceStore.getState().add(
      fileName ? { ...place, photoUri: resolvePhotoUri(fileName) } : place
    );

    updateProgress({ ink: getProgress().ink - CONFIG.INK_COST_PLACE });
    refreshProgressStore(); // HUD 잉크 갱신
    return 'ok';
  } catch (e) {
    console.warn('[places] create failed:', e);
    return 'error';
  }
}

/** 내용 수정 (이모지·이름·메모·사진). photoUri: undefined=유지, null=제거, 임시URI=교체. */
export function updatePlaceInfo(
  place: Place,
  draft: { emoji: string; name: string; memo?: string; photoUri?: string | null }
): Place | null {
  try {
    let fileName: string | undefined;
    if (draft.photoUri === undefined) {
      // 유지 — 스토어의 절대 URI에서 파일명만 복원
      fileName = place.photoUri ? place.photoUri.split('/').pop() : undefined;
    } else if (draft.photoUri === null) {
      if (place.photoUri) deletePhotoFile(place.photoUri);
      fileName = undefined;
    } else {
      if (place.photoUri) deletePhotoFile(place.photoUri); // 교체 — 구 파일 정리
      fileName = persistPhoto(draft.photoUri, place.id);
    }

    const next: Place = {
      ...place,
      emoji: draft.emoji,
      name: draft.name.trim(),
      memo: draft.memo?.trim() || undefined,
      photoUri: fileName,
    };
    updatePlaceRow(next);
    const forStore = fileName ? { ...next, photoUri: resolvePhotoUri(fileName) } : next;
    usePlaceStore.getState().update(forStore);
    return forStore;
  } catch (e) {
    console.warn('[places] update failed:', e);
    return null;
  }
}

/** 위치 이동 — 좌표 갱신 + 주소 재조회. */
export async function movePlace(place: Place, lat: number, lng: number): Promise<Place> {
  const address = (await reverseAddress(lat, lng)) ?? place.address;
  // DB엔 파일명으로 (스토어의 place.photoUri는 절대 URI일 수 있음)
  const fileName = place.photoUri ? place.photoUri.split('/').pop() : undefined;
  const next: Place = { ...place, lat, lng, address };
  updatePlaceRow({ ...next, photoUri: fileName });
  usePlaceStore.getState().update(next);
  return next;
}

/** 장소 삭제 — 사진 파일까지 정리. 잉크 환불 없음. */
export function removePlace(place: Place): void {
  if (place.photoUri) deletePhotoFile(place.photoUri);
  deletePlaceRow(place.id);
  usePlaceStore.getState().remove(place.id);
}
