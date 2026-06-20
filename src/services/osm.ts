import { CONFIG } from '../constants/config';
import { isLegendaryName, isSubwayHub } from '../constants/curatedLandmarks';
import type { Landmark, LandmarkCategory } from '../types';

/**
 * OSM(Overpass) 전담 모듈. 주변 랜드마크를 조회해 Landmark[]로 반환.
 * 네트워크 실패 시 null (재시도 가능하도록 빈 배열과 구분).
 */

// 안정성을 위해 여러 Overpass 엔드포인트를 순서대로 시도 (앞쪽이 우선).
const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
// Overpass 예절: 의미 있는 User-Agent 필수 (없으면 406/429).
const USER_AGENT = 'FogWalk/1.0 (exploration app; cdy8648@naver.com)';

type Tags = Record<string, string | undefined>;

function categorize(tags: Tags): LandmarkCategory {
  if (tags.railway === 'station' && (tags.station === 'subway' || tags.subway === 'yes')) {
    return 'subway';
  }
  if (tags.man_made === 'tower') return 'tower';
  if (tags.man_made === 'bridge') return 'bridge';
  if (tags.natural === 'peak') return 'peak';
  if (tags.tourism === 'museum') return 'museum';
  if (tags.leisure === 'park' || tags.boundary === 'national_park') return 'park';
  const h = tags.historic;
  if (h === 'palace' || h === 'castle' || h === 'fort' || h === 'fortress' || h === 'city_gate') {
    return 'palace';
  }
  if (h === 'monument' || h === 'memorial') return 'monument';
  if (tags.amenity === 'place_of_worship') {
    // 사찰만 temple, 그 외(성당·교회 등)는 historic 로 (⛩️ 오용 방지)
    return tags.religion === 'buddhist' ? 'temple' : 'historic';
  }
  if (h) return 'historic';
  if (tags.tourism === 'attraction') return 'attraction';
  return 'other';
}

/**
 * 희귀도 산정. 큐레이션 이름 = 전설, 지하철 = 거점만 희귀.
 * 그 외는 신호 점수: wikidata/문화재(+2) · attraction(+1) · height≥100(+1).
 */
function rarityOf(tags: Tags, name: string, category: LandmarkCategory): string {
  if (category === 'subway') return isSubwayHub(name) ? 'rare' : 'common';
  if (isLegendaryName(name)) return 'legendary';
  let score = 0;
  if (tags.wikidata || tags.wikipedia) score += 2;
  if (tags.heritage || tags['heritage:operator']) score += 2;
  if (tags.tourism === 'attraction') score += 1;
  const h = parseFloat(tags.height ?? '');
  if (!Number.isNaN(h) && h >= 100) score += 1;
  if (score >= 4) return 'legendary';
  if (score >= 2) return 'rare';
  return 'common';
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Tags;
}

export async function fetchLandmarksAround(
  lat: number,
  lng: number,
  radiusM: number
): Promise<Landmark[] | null> {
  const a = `around:${radiusM},${lat},${lng}`;
  // 강한 신호(wikidata/문화재/관광/규모)가 있는 것만 — 동네 교회·급수탑·작은 공원 제외.
  const query = `[out:json][timeout:25];
(
  nwr(${a})[historic~"^(castle|palace|fort|fortress|city_gate|monument|memorial|archaeological_site)$"][name];
  nwr(${a})[historic][wikidata][name];
  nwr(${a})[tourism=attraction][wikidata][name];
  nwr(${a})[tourism~"^(museum|viewpoint|artwork)$"][name];
  nwr(${a})[man_made=tower][name][height];
  nwr(${a})[man_made=tower][tourism][name];
  nwr(${a})[man_made=bridge][wikidata][name];
  nwr(${a})[natural=peak][name][wikidata];
  nwr(${a})[natural=peak][name][ele];
  nwr(${a})[leisure=park][wikidata][name];
  nwr(${a})[boundary=national_park][name];
  nwr(${a})[amenity=place_of_worship][wikidata][name];
  nwr(${a})[amenity=place_of_worship][heritage][name];
  nwr(${a})[railway=station][station=subway][name];
  nwr(${a})[railway=station][subway=yes][name];
);
out center 200;`;

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: 'data=' + encodeURIComponent(query),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('json')) continue; // 다음 엔드포인트
      const json = (await res.json()) as { elements?: OverpassElement[] };
      return parseElements(json.elements ?? []);
    } catch {
      continue;
    }
  }
  return null; // 모든 엔드포인트 실패 → 재시도 가능하도록 null
}

function parseElements(elements: OverpassElement[]): Landmark[] {
  const out: Landmark[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!name || elLat == null || elLng == null) continue;
    const category = categorize(tags);
    // wikidata 없는 봉우리는 낮은 동산 제외 (고도 기준)
    if (category === 'peak' && !tags.wikidata && !tags.wikipedia) {
      const ele = parseFloat(tags.ele ?? '');
      if (Number.isNaN(ele) || ele < CONFIG.PEAK_MIN_ELE_M) continue;
    }
    out.push({
      osmId: `${el.type}/${el.id}`,
      name,
      category,
      lat: elLat,
      lng: elLng,
      rarity: rarityOf(tags, name, category),
    });
  }
  return out;
}
