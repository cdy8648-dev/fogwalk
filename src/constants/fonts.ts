// 라틴/숫자 전용 폰트 + 한글 세리프 (display/mono 엔 한글 글리프 없음 — 한글 UI는 시스템 폰트).
export const FONT = {
  display: 'SpaceGrotesk_700Bold', // 큰 숫자·레벨·카운트
  mono: 'DMMono_400Regular', // 라벨·타임스탬프 (영문 대문자)
  monoMedium: 'DMMono_500Medium',
  serif: 'NotoSerifKR_700Bold', // 여권 국가명 (한글 세리프)
} as const;
