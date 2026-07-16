// packs/*.json → packs/manifest.json
// 클라이언트가 첫 방문 국가의 팩 존재·크기를 알아 자동/보류를 판단하는 인덱스.
// { "JP": { "bytes": 366000, "regions": 47 }, ... }  (키=대문자 ISO2, bytes=원본 JSON 크기)
// 실행: node scripts/gen-pack-manifest.js  (팩 추가/재생성 후 매번)
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'packs');
const OUT = path.join(DIR, 'manifest.json');

const manifest = {};
for (const f of fs.readdirSync(DIR).sort()) {
  if (!f.endsWith('.json') || f === 'manifest.json') continue;
  const full = path.join(DIR, f);
  const bytes = fs.statSync(full).size;
  const pack = JSON.parse(fs.readFileSync(full, 'utf8'));
  const cc = (pack.country || f.replace(/\.json$/, '')).toUpperCase();
  manifest[cc] = { bytes, regions: pack.level1?.length ?? 0 };
}

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
const rows = Object.entries(manifest)
  .map(([cc, m]) => `${cc} ${(m.bytes / 1024 / 1024).toFixed(2)}MB(${m.regions})`)
  .join('  ');
console.log(`✅ manifest.json: ${Object.keys(manifest).length}개국 — ${rows}`);
