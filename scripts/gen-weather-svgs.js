// assets/weather/wx-*.svg → src/constants/weatherSvgs.ts
// 상태 카드 날씨 칩 아이콘 9종. 마커 생성기와 동일 원칙:
//  - 한 번에 1종만 렌더(칩)이라 id 네임스페이스 불필요(원본에 id도 없음).
//  - rgba stop-color → rgb+opacity 변환은 여기선 불필요(원본이 이미 opacity 속성 사용).
// 실행: node scripts/gen-weather-svgs.js (에셋 추가/수정 후 재생성)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'weather');
const OUT = path.join(ROOT, 'src', 'constants', 'weatherSvgs.ts');

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort();
const entries = files.map((f) => {
  const key = f.replace(/\.svg$/, '');
  const xml = fs.readFileSync(path.join(SRC, f), 'utf8').trim().replace(/\r?\n/g, '');
  return `  '${key}': ${JSON.stringify(xml)},`;
});

const banner = `// AUTO-GENERATED from assets/weather — 편집 금지(재생성: node scripts/gen-weather-svgs.js).
/* eslint-disable */
export const WEATHER_SVG: Record<string, string> = {
${entries.join('\n')}
};
`;

fs.writeFileSync(OUT, banner);
console.log(`wrote ${OUT} (weather ${entries.length})`);
