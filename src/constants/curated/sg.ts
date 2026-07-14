import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇸🇬 싱가포르 큐레이션 (34곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-14): P17=Q334 교차확인.
 */
export const SG_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q208760', name: '머라이언', aliases: ['Merlion', '머라이언 파크', 'Merlion Park'], rarity: 'legendary', cheer: '사자 머리, 물고기 몸의 상징을 마주했습니다' },
  { qid: 'Q3046409', name: '싱가포르 식물원', aliases: ['Singapore Botanic Gardens'], rarity: 'legendary', unesco: true, cheer: '열대의 초록이 우거진 유네스코 정원을 거닐었습니다' },
  { qid: 'Q839965', name: '불치사', aliases: ['Buddha Tooth Relic Temple', 'Buddha Tooth Relic Temple and Museum'], rarity: 'legendary', cheer: '차이나타운 한복판, 부처의 치아사리를 모신 곳을 발견했습니다' },
  { qid: 'Q2428845', name: '스리 마리암만 사원', aliases: ['Sri Mariamman Temple'], rarity: 'legendary', cheer: '싱가포르에서 가장 오래된 힌두 사원의 색채를 마주했습니다' },
  { qid: 'Q1907146', name: '술탄 모스크', aliases: ['Masjid Sultan', 'Sultan Mosque'], rarity: 'legendary', cheer: '황금 돔 아래, 캄퐁글람의 신앙을 발견했습니다' },
  { qid: 'Q2158122', name: '천복궁', aliases: ['Thian Hock Keng', 'Thian Hock Keng Temple'], rarity: 'legendary', cheer: '이민자들이 세운 가장 오래된 도교 사원에 닿았습니다' },
  { qid: 'Q1538837', name: '래플스 호텔', aliases: ['Raffles Hotel'], rarity: 'legendary', cheer: '싱가포르 슬링이 탄생한 하얀 회랑을 거닐었습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q548679', name: '마리나 베이 샌즈', aliases: ['Marina Bay Sands', 'MBS'], rarity: 'epic', cheer: '옥상의 배를 얹은 세 개의 탑을 발견했습니다' },
  { qid: 'Q630135', name: '가든스 바이 더 베이', aliases: ['Gardens by the Bay'], rarity: 'epic', cheer: '미래에서 온 듯한 정원의 숲에 들어섰습니다' },
  { qid: 'Q120450702', name: '슈퍼트리 그로브', aliases: ['Supertree Grove'], rarity: 'epic', cheer: '거대한 철제 나무들이 빛나는 밤의 숲을 밝혔습니다' },
  { qid: 'Q752407', name: '싱가포르 플라이어', aliases: ['Singapore Flyer'], rarity: 'epic', cheer: '마리나베이를 내려다보는 거대한 관람차에 올랐습니다' },
  { qid: 'Q28419359', name: '주얼 창이 공항', aliases: ['Jewel Changi Airport', '주얼'], rarity: 'epic', cheer: '실내 폭포가 쏟아지는 공항의 정원을 발견했습니다' },
  { qid: 'Q2681107', name: '헬릭스 브리지', aliases: ['Helix Bridge', 'The Helix Bridge'], rarity: 'epic', cheer: 'DNA 이중나선을 닮은 다리를 건넜습니다' },
  { qid: 'Q1186714', name: '유니버설 스튜디오 싱가포르', aliases: ['Universal Studios Singapore', 'USS'], rarity: 'epic', cheer: '동남아 유일의 영화 테마파크에 입성했습니다' },
  { qid: 'Q559113', name: '에스플러네이드', aliases: ['Esplanade', 'Esplanade – Theatres on the Bay'], rarity: 'epic', cheer: '두리안을 닮은 공연예술의 전당을 발견했습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q1318670', name: '차이나타운', aliases: ['Chinatown'], rarity: 'rare', cheer: '향내음 가득한 이민자들의 거리를 누볐습니다' },
  { qid: 'Q2392844', name: '리틀인디아', aliases: ['Little India'], rarity: 'rare', cheer: '향신료와 색채가 넘치는 인도의 거리를 걸었습니다' },
  { qid: 'Q4251481', name: '캄퐁글람', aliases: ['Kampong Glam', 'Kampung Glam'], rarity: 'rare', cheer: '말레이 왕실의 흔적이 남은 거리를 거닐었습니다' },
  { qid: 'Q1095828', name: '클라크키', aliases: ['Clarke Quay'], rarity: 'rare', cheer: '알록달록 지붕 아래 강변의 밤을 즐겼습니다' },
  { qid: 'Q4931498', name: '보트키', aliases: ['Boat Quay'], rarity: 'rare', cheer: '초승달 모양의 옛 무역 부두를 거닐었습니다' },
  { qid: 'Q2735712', name: '오차드로드', aliases: ['Orchard Road'], rarity: 'rare', cheer: '쇼핑의 거리, 싱가포르의 번화가를 걸었습니다' },
  { qid: 'Q870844', name: '센토사섬', aliases: ['Sentosa', 'Sentosa Island'], rarity: 'rare', cheer: '평화라는 이름의 리조트 섬에 발을 디뎠습니다' },
  { qid: 'Q2709506', name: '싱가포르 동물원', aliases: ['Singapore Zoo'], rarity: 'rare', cheer: '열대우림 속 개방형 동물원을 탐험했습니다' },
  { qid: 'Q632689', name: '싱가포르 국립박물관', aliases: ['National Museum of Singapore'], rarity: 'rare', cheer: '가장 오래된 박물관에서 섬나라의 역사를 만났습니다' },
  { qid: 'Q1438470', name: '포트캐닝힐', aliases: ['Fort Canning Park', 'Fort Canning Hill'], rarity: 'rare', cheer: '옛 왕들이 잠든 언덕의 정원을 올랐습니다' },
  { qid: 'Q1018484', name: '호파빌라', aliases: ['Haw Par Villa', 'Tiger Balm Garden'], rarity: 'rare', cheer: '타이거밤 형제가 세운 기묘한 조각공원을 발견했습니다' },
  { qid: 'Q1928550', name: '풀라우 우빈', aliases: ['Pulau Ubin'], rarity: 'rare', cheer: '시간이 멈춘 옛 싱가포르의 섬마을에 닿았습니다' },
  { qid: 'Q5071985', name: '창이비치공원', aliases: ['Changi Beach Park'], rarity: 'rare', cheer: '섬 동쪽 끝, 바닷바람이 부는 해변을 걸었습니다' },
  { qid: 'Q1454776', name: '싱가포르강', aliases: ['Singapore River'], rarity: 'rare', cheer: '무역선이 오가던 도시의 젖줄을 따라 걸었습니다' },
  { qid: 'Q6970475', name: '내셔널 갤러리 싱가포르', aliases: ['National Gallery Singapore'], rarity: 'rare', cheer: '옛 시청과 대법원을 이은 미술관을 발견했습니다' },
  { qid: 'Q633033', name: '아시아문명박물관', aliases: ['Asian Civilisations Museum'], rarity: 'rare', cheer: '강변에서 아시아 문명의 자취를 만났습니다' },
  { qid: 'Q3521764', name: '이스트코스트공원', aliases: ['East Coast Park'], rarity: 'rare', cheer: '해안선을 따라 이어진 여가의 공원을 거닐었습니다' },
  { qid: 'Q6920714', name: '마운트페이버', aliases: ['Mount Faber'], rarity: 'rare', cheer: '케이블카가 떠나는 언덕에서 항구를 내려다보았습니다' },
  { qid: 'Q113800717', name: '버드 파라다이스', aliases: ['Bird Paradise', 'Mandai Bird Paradise'], rarity: 'rare', cheer: '세계 최대급 실내 조류공원의 날갯짓을 만났습니다' },
  { qid: 'Q7337785', name: '리버 원더스', aliases: ['River Wonders', 'River Safari'], rarity: 'rare', cheer: '판다와 강의 생명들이 어우러진 사파리를 탐험했습니다' },
];
