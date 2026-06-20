# FogWalk 발견(Discovery) 시스템 정리안

> 검토용 문서입니다. 카테고리·큐레이션 목록·지하철·지도 라벨 방안을 정리했어요.
> 끝에 **결정이 필요한 항목**을 모아뒀어요.

## ✅ 구현 상태 (2026-06-20, 추천안대로 반영됨)
- [x] 카테고리 개편: palace/attraction/bridge/subway 추가, fountain 제거 (`types`, `constants/landmarks.ts`)
- [x] OSM 필터 강화: wikidata/문화재/관광/규모 신호 필수, 동네 교회·급수탑·작은 공원 제외 (`services/osm.ts`)
- [x] 사찰만 ⛩️, 성당·교회는 historic 로 분류 (⛩️ 오용 방지)
- [x] 큐레이션 부스트(이름 기반 전설) `constants/curatedLandmarks.ts`
- [x] 지하철역 발견 + 환승 거점 희귀 + 낮은 XP(`XP_SUBWAY=40`)
- [x] 다리(bridge, wikidata 있는 것) / 산 고도 필터(`PEAK_MIN_ELE_M=500`)
- [x] Collection/발견 상세에 "지하철" 칩·타일
- [x] 마이그레이션: 미발견 잡음 + fetched_areas 정리 후 재수집(발견 기록은 보존)
- [ ] **지도 라벨 정리(7번): Studio 커스텀 스타일 URL 필요 → 보류 중**

---

## 1. 지금 뭐가 문제인가

| 문제 | 원인 (현재 코드) |
|------|------|
| 동네 교회·작은 절이 랜드마크로 등록됨 | `osm.ts`의 `categorize()`가 `amenity=place_of_worship`이면 무조건 `temple`로 분류 |
| 시시한 곳이 너무 많이 잡힘 | Overpass 쿼리가 `name`만 있으면 **모든 historic / park / tower**를 수집 (급수탑, 동네 공원 등) |
| "전설/희귀"가 거의 안 뜸 | 희귀도 점수가 wikidata/height에만 의존 → 대부분 `common` |
| 식당·가게 라벨이 지도에 가득 | Mapbox 기본 다크 스타일을 그대로 사용 (POI 라벨 on) |
| 지하철역이 발견요소에 없음 | 미구현 |

---

## 2. 발견 카테고리 재정의

발견요소 = **랜드마크(여러 종류) + 지하철역**. 카테고리별 이모지·정의·희귀도 경향을 아래처럼 정리합니다.

| 카테고리 | 이모지 | 정의 / 무엇이 들어오나 | 희귀도 경향 |
|---------|:---:|------|------|
| `palace` (궁궐·성곽) | 🏯 | 궁궐, 읍성, 산성, 종묘/왕릉 등 | 희귀~전설 |
| `tower` (타워·전망대) | 🗼 | 전망 타워, 초고층 랜드마크 (높이 신호 필요) | 희귀~전설 |
| `temple` (사찰) | ⛩️ | **문화재로 등재된 전통 사찰만** (일반 교회·예배당 제외) | 일반~전설 |
| `monument` (기념물) | 🗿 | 역사 기념물/메모리얼 (wikidata/문화재 필요) | 일반~희귀 |
| `historic` (유적) | 🏛️ | 유적지, 사적, 고궁 부속물 등 | 일반~희귀 |
| `museum` (박물관·미술관) | 🖼️ | 국공립·주요 박물관/미술관 | 일반~희귀 |
| `park` (공원) | 🌳 | **큰 공원·국립공원·명소 공원만** (면적/명성 기준) | 일반~희귀 |
| `peak` (산) | ⛰️ | 이름난 산봉우리 (고도/wikidata 신호) | 일반~전설 |
| `attraction` (관광명소) | 📸 | `tourism=attraction` + wikidata (DDP, 한옥마을 등) | 희귀~전설 |
| `bridge` (다리) — *선택* | 🌉 | 한강 주요 교량 등 상징적 다리 | 희귀 |
| `subway` (지하철역) — *신규* | 🚇 | 지하철/도시철도 역 | 일반 (환승 거점 = 희귀) |

> `fountain`(분수)는 너무 흔해서 **제거** 제안. `other`는 백업용으로만 유지.

---

## 3. "무엇을 랜드마크로 인정할까" — OSM 필터 규칙

핵심 원칙: **"이름 있으면 OK"를 버리고, 의미 신호(wikidata/문화재/관광/규모)가 있어야 인정.**

### ✅ 포함 (강한 신호)
- `wikidata` 또는 `wikipedia` 태그가 있는 것 (가장 강력 — 위키에 등재된 곳)
- `heritage` / `heritage:operator` (문화재 등재)
- `tourism=attraction` + `name`
- `historic=castle|palace|fort|city_gate|archaeological_site|monument|memorial`
- `tourism=museum` (주요)
- `man_made=tower` + `height ≥ 30` 또는 `tourism`
- `natural=peak` + (`wikidata` 또는 `ele ≥ 500`)
- `leisure=park` + (`wikidata` 또는 면적 큰 곳 / `boundary=national_park`)

### ❌ 제외 (잡음)
- `amenity=place_of_worship` 중 **문화재/wikidata 없는 것** (동네 교회·예배당·작은 절)
- `man_made=tower` 중 급수탑·통신탑 등 (height 없음/낮음)
- 면적 작은 동네 공원, 놀이터(`leisure=playground`)
- 이름 없는 모든 것

### 큐레이션 부스트 (권장 방식)
좌표는 OSM에서 받되, **유명한 곳의 희귀도를 wikidata QID로 끌어올리는 화이트리스트**를 둡니다.
예) `Q487496`(경복궁) → `legendary`. 이러면 좌표 하드코딩 없이도 4번 목록의 등급을 보장할 수 있어요.

---

## 4. 큐레이션: 한국 랜드마크 목록 (조사 결과)

> 아래는 "랜드마크라 부를 만한 것"의 셀렉션입니다. 좌표는 구현 시 OSM/wikidata로 채웁니다.
> ⭐전설 / ✦희귀 / ·일반.

### ⭐ 전설 (국가 상징급)
| 이름 | 카테고리 | 지역 | 비고 |
|------|------|------|------|
| 경복궁 | palace | 서울 | 조선 정궁 |
| 창덕궁·후원 | palace | 서울 | 유네스코 |
| 종묘 | historic | 서울 | 유네스코 |
| N서울타워(남산서울타워) | tower | 서울 | |
| 롯데월드타워 | tower | 서울 | 국내 최고층 |
| 숭례문(남대문) | historic | 서울 | 국보 1호 |
| 동대문디자인플라자(DDP) | attraction | 서울 | |
| 수원 화성 | palace | 수원 | 유네스코 |
| 불국사 | temple | 경주 | 유네스코 |
| 석굴암 | temple | 경주 | 유네스코 |
| 첨성대 | historic | 경주 | |
| 안동 하회마을 | historic | 안동 | 유네스코 |
| 해인사 장경판전 | temple | 합천 | 유네스코 |
| 광안대교 | bridge | 부산 | |
| 한라산 | peak | 제주 | 최고봉 |
| 성산일출봉 | peak | 제주 | 유네스코 |

### ✦ 희귀 (전국적으로 유명)
| 이름 | 카테고리 | 지역 |
|------|------|------|
| 덕수궁 / 창경궁 / 경희궁 | palace | 서울 |
| 봉은사 / 조계사 | temple | 서울 |
| 국립중앙박물관 / 국립현대미술관 | museum | 서울·과천 |
| 63빌딩 | tower | 서울 |
| 올림픽공원 / 서울숲 / 한강공원(여의도·반포) / 남산공원 | park | 서울 |
| 북한산(백운대) / 관악산 / 도봉산 | peak | 서울 근교 |
| 설악산 / 지리산 / 북한산국립공원 | peak | 전국 |
| 광화문광장 / 청계천 / 코엑스 별마당도서관 | attraction | 서울 |
| 롯데월드 / 에버랜드 | attraction | 서울·용인 |
| 전주 한옥마을 | historic | 전주 |
| 감천문화마을 / 자갈치시장 / 해운대 | attraction | 부산 |
| 송도 센트럴파크 / 인천 차이나타운 | attraction | 인천 |
| 남한산성 | palace | 경기 |
| 통도사 / 송광사 / 법주사 | temple | 전국 |
| 우도 / 협재해변 / 만장굴 | attraction | 제주 |

### · 일반
- 향교·서원, 지역 사적, 중소 박물관, 동네 큰 공원, 이름난 동네 산 등
  → **OSM 동적 수집(3번 규칙)** 이 자동으로 채움. 큐레이션 불필요.

> 📌 더 넣거나 빼고 싶은 곳 있으면 이 표에 직접 메모해주세요.

---

## 5. 지하철역을 발견요소로

- **소스**: OSM `railway=station` + (`station=subway` 또는 `subway=yes`). 별도 Overpass 쿼리로 수집.
- **발견 방식**: 기존 랜드마크와 동일 — 150m 안에 들어오면 발견, 마커는 발견 후에만 표시.
- **희귀도**:
  - 일반역 → `common` 🚇
  - **환승 거점** → `rare` (예: 서울역·강남·잠실·사당·신도림·동대문역사문화공원·고속터미널·왕십리·합정·부산 서면 등)
- **보상(XP)**: 역은 수가 많으니 **낮게** (예: 30~40 XP). 안 그러면 도심에서 XP 양산됨.
- **우려**: 서울만 300역+. 마커가 많아질 수 있어 → 발견한 역만 표시 + 도감에서 "지하철" 별도 섹션으로.
- **대안**: 노선도 느낌으로 "발견한 역 N개 / 전체 M개"를 도감에 게이지로 보여주면 수집 재미↑.

---

## 6. 희귀도 & 보상 (XP)

| 희귀도 | XP | 비고 |
|------|---:|------|
| 전설 legendary | 800 | 현행 유지 |
| 희귀 rare | 250 | 현행 유지 |
| 일반 common | 80 | 현행 유지 |
| 지하철 subway | 30~40 | 신규 (낮게) |

희귀도 산정 = wikidata(+2) · 문화재/heritage(+2) · tourism=attraction(+1) · height≥100(+1) · 큐레이션 부스트. 점수 ≥4 전설 / ≥2 희귀 / 그 외 일반 (역은 환승 거점만 희귀).

---

## 7. 지도 라벨 정리 (식당·가게 숨기기)

Mapbox 기본 스타일은 앱에서 개별 라벨을 끄기 어려워서 **둘 중 하나**가 필요해요:

- **(A) 권장 — 커스텀 스타일**: Mapbox Studio에서 다크 스타일 복제 → POI/상점/교통 라벨 레이어 끄고, 장소/물/공원/주요 도로만 남김. (원하면 나중에 아이보리 베이스까지) → 스타일 URL을 `constants/mapStyles.ts`에 넣으면 끝. **Studio URL만 주시면 등록**해둘게요.
- **(B) Mapbox Standard 스타일 사용 시**: `showPointOfInterestLabels=false`, `showTransitLabels=false` 같은 설정 prop으로 끌 수 있음. 단 현재 쓰는 스타일이 Standard인지 확인 필요.

> 즉, 라벨 정리는 "코드"보다 "스타일" 작업이에요. 디자인 시스템(design.md §6)의 "아이보리 베이스 + POI 정리" 목표와 같은 작업입니다.

---

## 8. 구현 계획 (확정 후 작업할 것)

| 파일 | 변경 |
|------|------|
| `types/index.ts` | `LandmarkCategory`에 `subway`, `attraction`, `palace`, `bridge` 추가 / `fountain` 제거 |
| `constants/landmarks.ts` | 새 카테고리 이모지, 라벨 |
| `constants/curatedLandmarks.ts` (신규) | wikidata QID → 희귀도 부스트 화이트리스트 (4번 목록) |
| `services/osm.ts` | Overpass 쿼리 강화(3번 규칙) + 지하철 쿼리 추가 + `categorize`/`rarityOf` 개편 |
| `constants/config.ts` | `XP_SUBWAY`, 공원 최소 면적, 지하철 발견 반경 등 |
| `services/discovery.ts` | 지하철 XP 분기, 축하 문구 |
| `CollectionScreen` / `DiscoveryDetailScreen` | 카테고리 칩에 "지하철" 추가, 도감 섹션 |
| `constants/mapStyles.ts` | 커스텀 스타일 URL (7번, Studio URL 받으면) |

⚠️ **주의**: 발견 로직만 바꾸는 거라 **H3 reset 불필요**(밝힌 땅 데이터 보존). 이미 잘못 등록된 기존 랜드마크는 1회 재정리(삭제 후 재수집) 필요할 수 있음 — 구현 시 마이그레이션 가드 넣을게요.

---

## 9. 결정이 필요한 항목 ✅

1. **큐레이션 방식**: (a) wikidata 부스트 화이트리스트(좌표는 OSM, 권장) vs (b) 좌표까지 직접 하드코딩? → 권장: **(a)**
2. **4번 목록**: 추가/삭제할 곳 있나요? (특히 자주 가는 지역)
3. **지하철**: 발견요소로 넣기 확정? 환승 거점만 희귀 처리 OK?
4. **`bridge`(다리), `fountain`(분수)**: 다리 추가 / 분수 제거 — 동의하시나요?
5. **지도 라벨(7번)**: Studio 커스텀 스타일로 갈까요? (가능하면 Studio URL 공유, 아니면 제가 스타일 JSON 초안을 만들 수도 있어요)
6. **지하철 도감 표현**: 개별 마커 + "N/M역" 게이지, 둘 다 할까요?
