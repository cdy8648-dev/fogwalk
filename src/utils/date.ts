// 수집 상세 화면 등에서 쓰는 날짜 표기 (한국어, 짧게).
export function formatDate(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}
