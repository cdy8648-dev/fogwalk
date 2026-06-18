/** ISO 2글자 국가코드 → 국기 이모지 (별도 에셋 없이). 예: 'KR' → 🇰🇷 */
export function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
