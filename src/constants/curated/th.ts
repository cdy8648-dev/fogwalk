import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇹🇭 태국 큐레이션 (36곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-06): P17=Q869 교차확인.
 */
export const TH_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q873769', name: '방콕 왕궁', aliases: ['그랜드 팰리스', 'Grand Palace', 'พระบรมมหาราชวัง'], rarity: 'legendary', cheer: '태국 왕실의 위엄, 황금빛 왕궁에 닿았습니다' },
  { qid: 'Q1045876', name: '왓 프라깨오', aliases: ['에메랄드 불상 사원', 'Wat Phra Kaew', 'Temple of the Emerald Buddha', 'วัดพระแก้ว'], rarity: 'legendary', cheer: '옥으로 빚은 에메랄드 불상 앞에 섰습니다' },
  { qid: 'Q724970', name: '왓 아룬', aliases: ['새벽사원', 'Wat Arun', 'วัดอรุณ'], rarity: 'legendary', cheer: '차오프라야강 노을 속 새벽사원을 밝혔습니다' },
  { qid: 'Q1059910', name: '왓 포', aliases: ['왓포', '와불사', 'Wat Pho', 'วัดโพธิ์'], rarity: 'legendary', cheer: '금빛으로 누운 거대한 와불을 마주했습니다' },
  { qid: 'Q1025100', name: '아유타야 역사공원', aliases: ['Ayutthaya Historical Park'], rarity: 'legendary', unesco: true, cheer: '시암 왕조 400년의 도읍, 그 폐허 위에 섰습니다' },
  { qid: 'Q423654', name: '수코타이 역사공원', aliases: ['Sukhothai Historical Park'], rarity: 'legendary', unesco: true, cheer: '태국 문명의 새벽, 수코타이의 첫 왕도를 거닐었습니다' },
  { qid: 'Q1517698', name: '왓 프라탓 도이수텝', aliases: ['도이수텝 사원', 'Wat Phra That Doi Suthep', 'วัดพระธาตุดอยสุเทพ'], rarity: 'legendary', cheer: '산 위에서 치앙마이를 굽어보는 황금탑을 발견했습니다' },
  { qid: 'Q496543', name: '왓 롱쿤', aliases: ['백색사원', 'White Temple', 'Wat Rong Khun', 'วัดร่องขุ่น'], rarity: 'legendary', cheer: '눈부신 백색 사원, 예술가의 꿈을 만났습니다' },
  { qid: 'Q511957', name: '피피섬', aliases: ['Phi Phi Islands', 'Koh Phi Phi'], rarity: 'legendary', cheer: '에메랄드빛 바다에 솟은 섬들의 절경에 닿았습니다' },
  { qid: 'Q13024284', name: '마야베이', aliases: ['Maya Bay', '더 비치'], rarity: 'legendary', cheer: '깎아지른 절벽이 감싼 전설의 해변을 찾았습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q1640197', name: '마하나콘', aliases: ['King Power Mahanakhon'], rarity: 'epic', cheer: '방콕의 스카이라인을 가르는 최고층 전망대에 올랐습니다' },
  { qid: 'Q194316', name: '수완나품 국제공항', aliases: ['수완나품공항', 'Suvarnabhumi Airport'], rarity: 'epic', cheer: '태국으로 통하는 하늘의 관문을 지났습니다' },
  { qid: 'Q1068311', name: '짜뚜짝 시장', aliases: ['Chatuchak Weekend Market', 'JJ 마켓'], rarity: 'epic', cheer: '만 오천 개의 가게가 늘어선 주말의 미로를 누볐습니다' },
  { qid: 'Q1235886', name: '에라완 사당', aliases: ['에라완 사원', 'Erawan Shrine', 'ศาลพระพรหม'], rarity: 'epic', cheer: '네 얼굴의 신이 지키는 도심의 성소를 찾았습니다' },
  { qid: 'Q2552433', name: '왓 트라이밋', aliases: ['황금 불상 사원', 'Wat Traimit', 'Golden Buddha Temple', 'วัดไตรมิตร'], rarity: 'epic', cheer: '순금 다섯 톤, 빛나는 황금 불상을 발견했습니다' },
  { qid: 'Q804055', name: '바이욕 타워 2', aliases: ['Baiyoke Tower II', '바이욕타워'], rarity: 'epic', cheer: '방콕에서 가장 높은 곳의 전망을 만끽했습니다' },
  { qid: 'Q2165719', name: '왓 벤차마보핏', aliases: ['대리석 사원', 'Wat Benchamabophit', 'Marble Temple', 'วัดเบญจมบพิตร'], rarity: 'epic', cheer: '이탈리아 대리석으로 지은 사원의 순백에 닿았습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q14754199', name: '왓 체디 루앙', aliases: ['Wat Chedi Luang', 'วัดเจดีย์หลวง'], rarity: 'rare', cheer: '지진에 허리 잘린 거대한 탑을 마주했습니다' },
  { qid: 'Q1657130', name: '왓 프라싱', aliases: ['Wat Phra Singh', 'วัดพระสิงห์'], rarity: 'rare', cheer: '치앙마이에서 가장 신성한 사자 불상의 사원을 찾았습니다' },
  { qid: 'Q13013059', name: '치앙마이 옛 성벽', aliases: ['타패문', 'Chiang Mai City Wall', 'Tha Phae Gate'], rarity: 'rare', cheer: '란나 왕국을 지키던 붉은 벽돌 성벽을 거닐었습니다' },
  { qid: 'Q1548655', name: '푸켓 빅부다', aliases: ['Big Buddha Phuket', 'Phuket Giant Buddha'], rarity: 'rare', cheer: '섬 전체를 굽어보는 흰 대리석 대불을 발견했습니다' },
  // QID 미확보(올드타운 지구 자체는 Wikidata 항목 없음, 도시 QID 오매칭 방지) — 이름 폴백
  { qid: null, name: '푸켓 올드타운', aliases: ['Phuket Old Town', 'Phuket Town'], rarity: 'rare', cheer: '시노-포르투갈 양식 건물이 늘어선 옛 거리를 걸었습니다' },
  { qid: 'Q630024', name: '파통 비치', aliases: ['Patong Beach'], rarity: 'rare', cheer: '푸켓의 밤을 밝히는 대표 해변에 닿았습니다' },
  { qid: 'Q1195730', name: '카오핑간', aliases: ['제임스본드 섬', 'James Bond Island', '코따부'], rarity: 'rare', cheer: '바다 위 뾰족한 바위섬, 영화 속 풍경을 찾았습니다' },
  { qid: 'Q664877', name: '라일레이 비치', aliases: ['Railay Beach'], rarity: 'rare', cheer: '석회암 절벽에 둘러싸인 숨은 해변을 발견했습니다' },
  { qid: 'Q15907894', name: '왓 프라야이', aliases: ['코사무이 빅부다', 'Big Buddha Koh Samui', 'Wat Phra Yai'], rarity: 'rare', cheer: '작은 섬을 지키는 12미터 황금 불상을 만났습니다' },
  { qid: 'Q13014948', name: '담넌 사두억 수상시장', aliases: ['Damnoen Saduak Floating Market'], rarity: 'rare', cheer: '쪽배가 오가는 물 위의 시장을 구경했습니다' },
  { qid: 'Q112117516', name: '매끌렁 기찻길 시장', aliases: ['Maeklong Railway Market', '우산 접는 시장'], rarity: 'rare', cheer: '기차가 지날 때마다 접히는 신기한 시장을 발견했습니다' },
  { qid: 'Q10825651', name: '에라완 폭포', aliases: ['Erawan Waterfall'], rarity: 'rare', cheer: '일곱 층 에메랄드빛 폭포를 오르며 물길을 따랐습니다' },
  { qid: 'Q2282230', name: '콰이강의 다리', aliases: ['River Kwai Bridge', 'Bridge on the River Kwai'], rarity: 'rare', cheer: '전쟁의 아픔을 품은 철교 위를 건넜습니다' },
  { qid: 'Q14734906', name: '골든트라이앵글', aliases: ['Sop Ruak', '쏩루악'], rarity: 'rare', cheer: '세 나라 국경이 만나는 메콩강 삼각지에 닿았습니다' },
  { qid: 'Q262459', name: '사낭 프라팃', aliases: ['진리의 성전', 'Sanctuary of Truth'], rarity: 'rare', cheer: '못 하나 없이 나무로 새긴 거대한 성전을 발견했습니다' },
  { qid: 'Q1203550', name: '카오산 로드', aliases: ['Khao San Road', 'Khaosan Road'], rarity: 'rare', cheer: '배낭여행자들의 밤이 계속되는 거리를 누볐습니다' },
  { qid: 'Q977437', name: '룸피니 공원', aliases: ['Lumphini Park'], rarity: 'rare', cheer: '고층빌딩 사이 도심 속 초록 쉼터를 거닐었습니다' },
  { qid: 'Q660585', name: '왓 마하탓', aliases: ['Wat Mahathat Ayutthaya'], rarity: 'rare', cheer: '보리수 뿌리에 감싸인 불상의 머리를 발견했습니다' },
  { qid: 'Q16306333', name: '후아힌 비치', aliases: ['Hua Hin Beach'], rarity: 'rare', cheer: '왕실이 사랑한 조용한 해변 마을에 닿았습니다' },
];
