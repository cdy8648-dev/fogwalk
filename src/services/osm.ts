import { CONFIG } from '../constants/config';
import { isLegendaryName, isSubwayHub } from '../constants/curatedLandmarks';
import type { Landmark, LandmarkCategory } from '../types';

/**
 * OSM(Overpass) 전담 모듈. 주변 랜드마크를 조회해 Landmark[]로 반환.
 * 네트워크 실패 시 null (재시도 가능하도록 빈 배열과 구분).
 */

// 여러 Overpass 엔드포인트를 순서대로 시도 (앞쪽이 우선).
// 프라이버시: 사용자 좌표가 전송되므로 EU 운영 미러만 사용(러시아 mail.ru 미러 제거).
// 조회 반경을 1km로 줄인 뒤 overpass-api.de 가 빠르고 안정적(≈2.5s).
const OVERPASS_ENDPOINTS = [
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
  // 가벼운 단일키 조회 — 의미 필터(wikidata/문화재 등)는 parseElements 에서 JS로.
  // (조건을 쿼리에 많이 넣으면 dense 지역에서 Overpass 가 타임아웃 → 전부 0건이 됨)
  const query = `[out:json][timeout:25];
(
  nwr(${a})[tourism~"^(attraction|museum|viewpoint|artwork|gallery|theme_park|zoo|aquarium)$"][name];
  nwr(${a})[historic][name];
  nwr(${a})[man_made~"^(tower|bridge)$"][name];
  nwr(${a})[natural=peak][name];
  nwr(${a})[leisure=park][name];
  nwr(${a})[boundary=national_park][name];
  nwr(${a})[amenity=place_of_worship][name];
  nwr(${a})[railway=station][station=subway][name];
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
      const json = (await res.json()) as {
        elements?: OverpassElement[];
        remark?: string;
      };
      // remark + 빈 결과 = 타임아웃/런타임 에러 → 실패로 보고 다음 엔드포인트 (잘못된 빈 캐시 방지)
      if (json.remark && (json.elements?.length ?? 0) === 0) continue;
      return parseElements(json.elements ?? []);
    } catch {
      continue;
    }
  }
  return null; // 모든 엔드포인트 실패 → 재시도 가능하도록 null
}

/**
 * "랜드마크라 부를 만한가" 판정 (의미 필터). 동네 교회·급수탑·작은 공원·잡관광지 제외.
 * 강한 신호 = wikidata/wikipedia, 문화재(heritage), 큐레이션 이름.
 */
function qualifies(tags: Tags, name: string, category: LandmarkCategory): boolean {
  const hasWiki = !!(tags.wikidata || tags.wikipedia);
  const hasHeritage = !!(tags.heritage || tags['heritage:operator']);
  switch (category) {
    case 'subway':
    case 'museum':
    case 'palace': // historic=castle/palace/fort/fortress/city_gate (본래 상징적)
      return true;
    case 'attraction':
      return hasWiki || isLegendaryName(name);
    case 'tower':
      return !!tags.height || !!tags.tourism || hasWiki;
    case 'bridge':
      return hasWiki;
    case 'park':
      return hasWiki || tags.boundary === 'national_park';
    case 'peak': {
      if (hasWiki) return true;
      const ele = parseFloat(tags.ele ?? '');
      return !Number.isNaN(ele) && ele >= CONFIG.PEAK_MIN_ELE_M;
    }
    // 사찰/성당·교회/기념물/일반유적: 위키 또는 문화재 등재가 있어야 인정
    case 'temple':
    case 'monument':
    case 'historic':
    default:
      return hasWiki || hasHeritage;
  }
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
    if (!qualifies(tags, name, category)) continue;
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
