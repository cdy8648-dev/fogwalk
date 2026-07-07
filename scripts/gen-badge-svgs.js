// assets/badges/*.svg → src/constants/badgeSvgs.ts
// 각 파일의 내부 id(ring/face/gloss 등)를 파일별 접두사로 네임스페이스해서
// 한 화면에 여러 뱃지를 그려도 그라디언트 id가 충돌하지 않게 한다.
// 실행: node scripts/gen-badge-svgs.js (뱃지 SVG 추가/수정 후 재생성)
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] ?? path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'badges');
const OUT = path.join(ROOT, 'src', 'constants', 'badgeSvgs.ts');

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort();

function namespaceIds(xml, prefix) {
  // 정의된 모든 id 수집
  const ids = new Set();
  for (const m of xml.matchAll(/id="([\w:-]+)"/g)) ids.add(m[1]);
  let out = xml;
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefix}${id}"`);
    out = out.replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}${id})`);
    out = out.replace(new RegExp(`(xlink:href|href)="#${esc}"`, 'g'), `$1="#${prefix}${id}"`);
  }
  return out;
}

const entries = files.map((f) => {
  const key = f.replace(/\.svg$/, '');
  const prefix = 'b' + key.split('-')[0] + '_'; // '11-streak-7' → 'b11_'
  let xml = fs.readFileSync(path.join(SRC, f), 'utf8').trim();
  xml = namespaceIds(xml, prefix);
  xml = xml.replace(/\r?\n/g, ''); // 한 줄로
  return `  '${key}': ${JSON.stringify(xml)},`;
});

const banner = `// AUTO-GENERATED from assets/badges/*.svg — 편집 금지(재생성: node scripts/gen-badge-svgs.js).
// 내부 그라디언트 id를 파일별 접두사로 네임스페이스해 화면 내 충돌을 방지함.
/* eslint-disable */
export const BADGE_SVG: Record<string, string> = {
${entries.join('\n')}
};
`;

fs.writeFileSync(OUT, banner);
console.log('wrote', OUT, '(' + files.length + ' badges)');
