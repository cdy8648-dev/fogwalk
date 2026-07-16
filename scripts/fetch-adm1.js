// geoBoundaries gbOpen에서 국가 ADM1(simplified) 경계를 받아 geodata/<ISO3>-ADM1.geojson 저장.
// 실행: node scripts/fetch-adm1.js JPN   (이미 있으면 skip, --force로 재다운로드)
// 이후 팩 생성: node scripts/gen-global-pack.js JPN jp
const fs = require('fs');
const path = require('path');
const https = require('https');

const ISO3 = process.argv[2];
const force = process.argv.includes('--force');
if (!ISO3) { console.error('사용법: node scripts/fetch-adm1.js <ISO3> [--force]'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'geodata', `${ISO3}-ADM1.geojson`);

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FogWalk-pack-gen' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function main() {
  if (fs.existsSync(OUT) && !force) { console.log(`skip (이미 있음): ${OUT}`); return; }
  const metaBuf = await get(`https://www.geoboundaries.org/api/current/gbOpen/${ISO3}/ADM1/`);
  const meta = JSON.parse(metaBuf.toString());
  const url = meta.gjDownloadURL.replace(/\.geojson$/, '_simplified.geojson');
  console.log(`받는 중: ${meta.boundaryName} ADM1 (${meta.admUnitCount}개) ← ${url}`);
  const data = await get(url);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, data);
  console.log(`✅ ${OUT} (${(data.length / 1024 / 1024).toFixed(2)} MB)`);
}
main().catch((e) => { console.error('실패:', e.message); process.exit(1); });
