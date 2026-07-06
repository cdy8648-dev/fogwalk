import * as Localization from 'expo-localization';

/**
 * 유저 폰의 시스템 언어 코드(예: 'ko', 'en', 'th'). 랜드마크 이름 다국어 표시에 사용.
 * 값이 없으면 'en'로 폴백.
 */
export function getUserLangCode(): string {
  return Localization.getLocales()[0]?.languageCode ?? 'en';
}
