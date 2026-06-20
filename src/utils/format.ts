/** 천 단위 콤마 (Hermes Intl 미지원 대비 수동 포맷). */
export function comma(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
