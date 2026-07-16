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

// 나만의 장소 아이콘 (assets/markers/place/place-*.svg) — 배경 없는 플랫 글리프.
// 키: 파일명 슬러그('place-flag' 등). id/필터 없음이지만 안전하게 동일 처리.
const PLACE_SRC = path.join(ROOT, 'assets', 'markers', 'place');
const places = fs.existsSync(PLACE_SRC) ? processDir(PLACE_SRC, 'mp', false) : [];

// 지도 마커 전용 글리프(assets/markers/glyph) — 등급별 폴더 + 줌아웃 별.
// 키: '<tier>/<name>' (common은 tier 없이 name). filter-* 는 제외(지도 마커 아님).
// 등급 글로우 gradient id(tg-legendary 등)가 파일마다 중복 → 등급+이름으로 네임스페이스.
function processMapGlyphs() {
  const base = path.join(ROOT, 'assets', 'markers', 'glyph');
  const tiers = [
    ['', base],
    ['legendary/', path.join(base, 'tiers', 'legendary')],
    ['heroic/', path.join(base, 'tiers', 'heroic')],
    ['rare/', path.join(base, 'tiers', 'rare')],
  ];
  const entries = [];
  for (const [prefix, dir] of tiers) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => /^(detail-|star-)/.test(f) && f.endsWith('.svg'))
      .sort();
    for (const f of files) {
      const name = f.replace(/\.svg$/, '');
      const key = prefix + name;
      let xml = fs.readFileSync(path.join(dir, f), 'utf8').trim();
      xml = namespaceIds(xml, `gm${key.replace(/[^a-z0-9]/gi, '')}_`);
      xml = fixRgbaStops(xml);
      xml = xml.replace(/\r?\n/g, '');
      entries.push(`  '${key}': ${JSON.stringify(xml)},`);
    }
  }
  return entries;
}

const mapGlyphs = processMapGlyphs();

const banner = `// AUTO-GENERATED from assets/markers — 편집 금지(재생성: node scripts/gen-marker-svgs.js).
// 코인: 드롭섀도 필터 제거됨(래퍼가 RN shadow로 재현), id 네임스페이스 처리.
/* eslint-disable */
export const MARKER_COIN: Record<string, string> = {
${coins.join('\n')}
};

export const MARKER_GLYPH: Record<string, string> = {
${glyphs.join('\n')}
};

// 지도 마커(라이트 지도 위 직접) — 등급 글로우 내장. 키 '<tier>/<name>'(common=name).
export const MAP_GLYPH: Record<string, string> = {
${mapGlyphs.join('\n')}
};

// 나만의 장소 아이콘 — 키 'place-<slug>'. 지도 핀 + 에디터 선택 그리드에 렌더.
export const PLACE_ICON: Record<string, string> = {
${places.join('\n')}
};
`;

fs.writeFileSync(OUT, banner);
console.log(
  `wrote ${OUT} (coins ${coins.length}, glyphs ${glyphs.length}, mapGlyphs ${mapGlyphs.length}, places ${places.length})`
);
