import { Directory, File, Paths } from 'expo-file-system';

// 사진 파일 경로 전담. iOS는 재설치/업데이트 시 Documents 절대경로의 컨테이너 UUID가
// 바뀌므로, DB엔 파일명만 저장하고 표시 시 현재 컨테이너 기준으로 경로를 재구성한다.

const PHOTO_DIR = 'photos';

/** 사진 저장 디렉터리 (현재 앱 컨테이너 기준). */
export function photoDir(): Directory {
  return new Directory(Paths.document, PHOTO_DIR);
}

/**
 * DB 저장값(파일명, 또는 구버전의 절대경로)을 현재 컨테이너 기준 절대 file:// URI로 변환.
 * 절대경로면 파일명만 떼어 재구성 → 컨테이너 경로가 바뀌어도 깨지지 않는다.
 */
export function resolvePhotoUri(stored: string): string {
  const name = stored.split('/').pop() ?? stored;
  return new File(photoDir(), name).uri;
}

/** 저장된 값(파일명/절대경로)에 해당하는 사진 파일 삭제. */
export function deletePhotoFile(stored: string): void {
  const name = stored.split('/').pop() ?? stored;
  const f = new File(photoDir(), name);
  if (f.exists) f.delete();
}
