// assets/markers/icons/*.svg (+glyph/) → src/constants/markerSvgs.ts
// 뱃지 생성기와 같은 호환 처리:
//  1) 파일 간 중복 id(face/gloss/rim…) 네임스페이스 — 한 화면 다중 렌더 시 그라디언트 충돌 방지
//  2) stop-color rgba → rgb + stop-opacity (react-native-svg가 알파 무시)
//  3) 코인의 <filter>(feDropShadow) 제거 — rn-svg 미지원 시 요소가 통째로 안 그려질 위험.
//     그림자는 앱의 CategoryCoin 래퍼가 RN shadow로 재현한다.
// 실행: node scripts/gen-marker-svgs.js (에셋 추가/수정 후 재생성)
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] ?? path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'markers', 'icons');
const OUT = path.join(ROOT, 'src', 'constants', 'markerSvgs.ts');

function namespaceIds(xml, prefix) {
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

function fixRgbaStops(xml) {
  return xml.replace(
    /stop-color="rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)"/g,
    (_, r, g, b, a) =>
      `stop-color="rgb(${r.trim()},${g.trim()},${b.trim()})" stop-opacity="${a.trim()}"`
  );
}

function stripDropShadowFilters(xml) {
  // <filter …>…</filter> 정의 제거 + 해당 filter="url(#…)" 참조 제거
  const removed = [];
  let out = xml.replace(/<filter\s+id="([\w:-]+)"[\s\S]*?<\/filter>\s*/g, (_, id) => {
    removed.push(id);
    return '';
  });
  for (const id of removed) {
    out = out.replace(new RegExp(`\\s*filter="url\\(#${id}\\)"`, 'g'), '');
  }
  return out;
}

function processDir(dir, prefixTag, stripFilters) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
  return files.map((f) => {
    const key = f.replace(/\.svg$/, '');
    let xml = fs.readFileSync(path.join(dir, f), 'utf8').trim();
    if (stripFilters) xml = stripDropShadowFilters(xml);
    xml = namespaceIds(xml, `${prefixTag}${key.replace(/[^a-z0-9]/gi, '')}_`);
    xml = fixRgbaStops(xml);
    xml = xml.replace(/\r?\n/g, '');
    return `  '${key}': ${JSON.stringify(xml)},`;
  });
}

const coins = processDir(SRC, 'mc', true);
const glyphs = processDir(path.join(SRC, 'glyph'), 'mg', false);

const banner = `// AUTO-GENERATED from assets/markers/icons — 편집 금지(재생성: node scripts/gen-marker-svgs.js).
// 코인: 드롭섀도 필터 제거됨(래퍼가 RN shadow로 재현), id 네임스페이스 처리.
/* eslint-disable */
export const MARKER_COIN: Record<string, string> = {
${coins.join('\n')}
};

export const MARKER_GLYPH: Record<string, string> = {
${glyphs.join('\n')}
};
`;

fs.writeFileSync(OUT, banner);
console.log(`wrote ${OUT} (coins ${coins.length}, glyphs ${glyphs.length})`);
