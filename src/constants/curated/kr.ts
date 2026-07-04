import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇰🇷 대한민국 큐레이션 (발견요소 4단계 마스터 시트 기준, 46곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-03): P17=Q884·P31·P1435 교차확인.
 */
export const KR_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 유네스코 세계유산 + 국보 · 1000XP ═══════════
  { qid: 'Q477157', name: '창덕궁', aliases: ['창덕궁·후원'], rarity: 'legendary', unesco: true, cheer: '조선의 비밀정원을 품은 궁궐을 깨웠습니다' },
  { qid: 'Q490497', name: '종묘', rarity: 'legendary', unesco: true, cheer: '왕들의 혼이 잠든 성역에 닿았습니다' },
  { qid: 'Q465345', name: '숭례문', aliases: ['남대문'], rarity: 'legendary', cheer: '서울의 관문, 국보 중의 국보를 발견했습니다' },
  { qid: 'Q482423', name: '수원 화성', aliases: ['수원화성', '화성'], rarity: 'legendary', unesco: true, cheer: '정조의 꿈이 깃든 성곽을 밝혔습니다' },
  { qid: 'Q562529', name: '남한산성', rarity: 'legendary', unesco: true, cheer: '겹겹의 산성, 그 역사의 능선에 올랐습니다' },
  { qid: 'Q408318', name: '불국사', rarity: 'legendary', unesco: true, cheer: '천년 신라의 미소를 마주했습니다' },
  { qid: 'Q489820', name: '석굴암', rarity: 'legendary', unesco: true, cheer: '돌 속에 새긴 깨달음을 발견했습니다' },
  // OSM은 사찰 본체(해인사)로 태그하는 경우가 많아 별칭 폴백 포함
  { qid: 'Q490798', name: '해인사 장경판전', aliases: ['해인사'], rarity: 'legendary', unesco: true, cheer: '팔만대장경을 지킨 성소에 닿았습니다' },
  { qid: 'Q562765', name: '경주 첨성대', aliases: ['첨성대'], rarity: 'legendary', unesco: true, cheer: '별을 읽던 신라의 하늘 아래 섰습니다' },
  { qid: 'Q17278215', name: '경주 대릉원', aliases: ['대릉원', '천마총'], rarity: 'legendary', unesco: true, cheer: '별을 읽던 신라의 하늘 아래 섰습니다' },
  { qid: 'Q45865', name: '안동 하회마을', aliases: ['하회마을'], rarity: 'legendary', unesco: true, cheer: '시간이 멈춘 양반의 마을을 거닐었습니다' },
  { qid: 'Q495266', name: '경주 양동마을', aliases: ['양동마을'], rarity: 'legendary', unesco: true, cheer: '오백 년 종가의 마을을 발견했습니다' },
  { qid: 'Q491454', name: '통도사', rarity: 'legendary', unesco: true, cheer: '부처의 진신사리를 품은 사찰을 깨웠습니다' },
  { qid: 'Q3540839', name: '부석사', rarity: 'legendary', unesco: true, cheer: '무량수전의 천년 배흘림기둥에 기댔습니다' },
  // ↓ 2018 '산사' 7곳 완결(마스터 시트엔 통도사·부석사만 있으나 세트로 유지)
  { qid: 'Q623978', name: '봉정사', rarity: 'legendary', unesco: true, cheer: '천등산 자락의 천년 고찰을 깨웠습니다' },
  { qid: 'Q484931', name: '법주사', rarity: 'legendary', unesco: true, cheer: '속리산 팔상전 아래 천년의 숨결에 닿았습니다' },
  { qid: 'Q624128', name: '마곡사', rarity: 'legendary', unesco: true, cheer: '태화산 물길이 감싸는 산사를 발견했습니다' },
  { qid: 'Q7451561', name: '선암사', rarity: 'legendary', unesco: true, cheer: '조계산 아래 무지개다리를 건넜습니다' },
  { qid: 'Q623807', name: '대흥사', rarity: 'legendary', unesco: true, cheer: '두륜산 품에 안긴 산사를 깨웠습니다' },
  { qid: 'Q494645', name: '한라산', rarity: 'legendary', unesco: true, cheer: '남녘의 지붕, 한라의 정상에 올랐습니다' },
  { qid: 'Q122225', name: '성산일출봉', rarity: 'legendary', unesco: true, cheer: '바다에서 솟은 일출의 왕관을 발견했습니다' },
  { qid: 'Q6750353', name: '만장굴', rarity: 'legendary', unesco: true, cheer: '수십만 년의 용암 동굴 속을 탐험했습니다' },
  { qid: 'Q483714', name: '반구천 암각화', aliases: ['반구대 암각화'], rarity: 'legendary', unesco: true, cheer: '선사인이 새긴 바위그림을 발견했습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q482485', name: '경복궁', rarity: 'epic', cheer: '조선 제일의 법궁, 그 중심에 섰습니다' },
  { qid: 'Q69134', name: 'N서울타워', aliases: ['남산서울타워', '서울타워', 'YTN서울타워'], rarity: 'epic', cheer: '남산 위 그 탑, 서울의 심장을 밝혔습니다' },
  { qid: 'Q494895', name: '롯데월드타워', rarity: 'epic', cheer: '구름을 뚫은 국내 최고봉을 발견했습니다' },
  { qid: 'Q5295847', name: '동대문디자인플라자', aliases: ['DDP', '동대문 디자인 플라자'], rarity: 'epic', cheer: '미래에서 온 듯한 곡선을 발견했습니다' },
  { qid: 'Q20932', name: '인천국제공항', aliases: ['인천공항'], rarity: 'epic', cheer: '세계로 통하는 대한민국의 관문입니다' },
  { qid: 'Q491203', name: '해운대해수욕장', aliases: ['해운대'], rarity: 'epic', cheer: '대한민국 대표 해변에 발자국을 남겼습니다' },
  { qid: 'Q485443', name: '광안대교', rarity: 'epic', cheer: '불빛 출렁이는 광안의 다리를 건넜습니다' },
  { qid: 'Q482644', name: '설악산', rarity: 'epic', cheer: '설악의 준봉, 그 절경을 정복했습니다' },
  { qid: 'Q11269655', name: '전주 한옥마을', aliases: ['전주한옥마을'], rarity: 'epic', cheer: '처마가 물결치는 한옥의 바다를 거닐었습니다' },

  // ═══════════ 희귀 (RARE) — 광역 대표 명소 · 250XP ═══════════
  { qid: 'Q482631', name: '덕수궁', rarity: 'rare', cheer: '돌담길 끝의 궁궐을 발견했습니다' },
  { qid: 'Q482852', name: '창경궁', rarity: 'rare', cheer: '달빛 어린 궁궐의 밤을 깨웠습니다' },
  { qid: 'Q135709', name: '봉은사', rarity: 'rare', cheer: '빌딩 숲 속 천년 사찰을 발견했습니다' },
  { qid: 'Q488824', name: '조계사', rarity: 'rare', cheer: '도심 한복판의 불심을 마주했습니다' },
  { qid: 'Q494407', name: '국립중앙박물관', rarity: 'rare', cheer: '오천 년이 잠든 보물창고를 열었습니다' },
  { qid: 'Q22968', name: '63빌딩', aliases: ['63스퀘어', '63시티'], rarity: 'rare', cheer: '황금빛 한강의 상징을 발견했습니다' },
  { qid: 'Q483014', name: '서울숲', rarity: 'rare', cheer: '도심 속 숲, 초록의 쉼터를 밝혔습니다' },
  { qid: 'Q486694', name: '올림픽공원', rarity: 'rare', cheer: '평화의 광장, 그 너른 잔디를 밟았습니다' },
  // QID 미확보(Wikidata 항목 없음) — 이름 폴백으로만 매칭
  { qid: null, name: '여의도한강공원', aliases: ['여의도 한강공원'], rarity: 'rare', cheer: '한강의 노을, 그 강변에 닿았습니다' },
  { qid: 'Q494652', name: '북한산', rarity: 'rare', cheer: '서울을 품은 백운대에 올랐습니다' },
  { qid: 'Q494668', name: '롯데월드', rarity: 'rare', cheer: '동심의 왕국에 입성했습니다' },
  { qid: 'Q71829204', name: '별마당도서관', aliases: ['코엑스 별마당도서관', '별마당 도서관'], rarity: 'rare', cheer: '책으로 쌓은 거대한 탑을 발견했습니다' },
  { qid: 'Q490981', name: '북촌한옥마을', aliases: ['북촌 한옥마을'], rarity: 'rare', cheer: '기와의 물결, 북촌의 골목을 거닐었습니다' },
  { qid: 'Q175477', name: '서울월드컵경기장', rarity: 'rare', cheer: '함성이 잠든 월드컵의 성지에 섰습니다' },
  { qid: 'Q562701', name: '잠실종합운동장', aliases: ['서울종합운동장', '잠실 종합운동장'], rarity: 'rare', cheer: '올림픽의 불꽃이 타올랐던 곳입니다' },
  { qid: 'Q18641306', name: '감천문화마을', rarity: 'rare', cheer: '산비탈의 무지개 마을을 발견했습니다' },
  { qid: 'Q16092201', name: '전주 경기전', aliases: ['경기전'], rarity: 'rare', cheer: '조선 왕조의 시작을 모신 곳입니다' },
  { qid: 'Q7561251', name: '송도 센트럴파크', aliases: ['송도센트럴파크', '센트럴파크'], rarity: 'rare', cheer: '바다를 끌어들인 도심 공원을 밝혔습니다' },
];
