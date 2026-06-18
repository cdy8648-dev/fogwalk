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
  if (tags.man_made === 'tower') return 'tower';
  if (tags.natural === 'peak') return 'peak';
  if (tags.tourism === 'museum') return 'museum';
  if (tags.leisure === 'park') return 'park';
  if (tags.amenity === 'fountain') return 'fountain';
  if (tags.amenity === 'place_of_worship') return 'temple';
  if (tags.historic === 'monument' || tags.historic === 'memorial') {
    return 'monument';
  }
  if (tags.historic) return 'historic';
  return 'other';
}

/** OSM 태그 신호로 희귀도 산정. wikidata/attraction/height 가 강할수록 희귀. */
function rarityOf(tags: Tags): string {
  let score = 0;
  if (tags.wikidata || tags.wikipedia) score += 2;
  if (tags.tourism === 'attraction') score += 1;
  const h = parseFloat(tags.height ?? '');
  if (!Number.isNaN(h) && h >= 100) score += 1;
  if (score >= 3) return 'legendary';
  if (score >= 1) return 'rare';
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
  const query = `[out:json][timeout:25];
(
  nwr(${a})[tourism~"^(attraction|museum|artwork|viewpoint)$"][name];
  nwr(${a})[historic][name];
  nwr(${a})[man_made=tower][name];
  nwr(${a})[natural=peak][name];
  nwr(${a})[leisure=park][name];
  nwr(${a})[amenity~"^(fountain|place_of_worship)$"][name];
);
out center 120;`;

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
    out.push({
      osmId: `${el.type}/${el.id}`,
      name,
      category: categorize(tags),
      lat: elLat,
      lng: elLng,
      rarity: rarityOf(tags),
    });
  }
  return out;
}
