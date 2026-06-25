/** 천 단위 콤마 (Hermes Intl 미지원 대비 수동 포맷). */
export function comma(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 큰 수를 K/M/B로 축약 (2901→"2.9K", 1.5e6→"1.5M"). 1000 미만은 그대로. */
export function abbrev(n: number): string {
  const units = [
    { v: 1e9, s: 'B' },
    { v: 1e6, s: 'M' },
    { v: 1e3, s: 'K' },
  ];
  for (const { v, s } of units) {
    if (n >= v) {
      const x = n / v;
      const str = x >= 100 ? String(Math.round(x)) : x.toFixed(1).replace(/\.0$/, '');
      return str + s;
    }
  }
  return String(n);
}
