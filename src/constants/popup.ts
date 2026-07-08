/**
 * 팝업 크기 체계 — 대/중/소로 통일 (모서리·여백·최대폭 토큰).
 * 소(sm): 연필·간단 확인 · 중(md): 나만의 장소·뱃지 설명 · 대(lg): 발견/뱃지 보상 카드.
 * 지도 위에 뜨는 팝업은 글래스(GlassPanel), 딤 배경 위 카드는 solid(#11131F)를 쓴다.
 */
export const POPUP = {
  sm: { maxWidth: 300, radius: 16, padding: 14 },
  md: { maxWidth: 320, radius: 20, padding: 16 },
  lg: { radius: 26, padding: 20 }, // 폭은 화면폭 - 48
} as const;

// 팝업 공통 색 토큰
export const POPUP_COLORS = {
  cardSolid: '#11131F', // 딤 배경 위 카드
  glassTint: 'rgba(17,19,31,0.62)', // 글래스 반투명 틴트
  border: '#2E3450',
} as const;
