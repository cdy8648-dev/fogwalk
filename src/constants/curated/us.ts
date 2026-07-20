import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇺🇸 미국 큐레이션 (40곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-20): P17=Q30 교차확인.
 */
export const US_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q9202', name: '자유의 여신상', aliases: ['Statue of Liberty'], rarity: 'legendary', unesco: true, cheer: '자유의 횃불을 든 여신을 만났습니다' },
  { qid: 'Q44440', name: '골든게이트교', aliases: ['골든게이트 브리지', 'Golden Gate Bridge'], rarity: 'legendary', cheer: '붉은 다리, 샌프란시스코의 안개를 갈랐습니다' },
  { qid: 'Q220289', name: '그랜드캐니언 국립공원', aliases: ['그랜드 캐니언', 'Grand Canyon National Park', 'Grand Canyon'], rarity: 'legendary', unesco: true, cheer: '대지가 새긴 억겁의 협곡 앞에 섰습니다' },
  { qid: 'Q83497', name: '러시모어산', aliases: ['러시모어 산', 'Mount Rushmore'], rarity: 'legendary', cheer: '네 대통령의 얼굴이 새겨진 화강암을 올려다보았습니다' },
  { qid: 'Q35525', name: '백악관', aliases: ['White House'], rarity: 'legendary', cheer: '미국 대통령의 관저, 그 하얀 지붕 아래 섰습니다' },
  // 캐나다와 국경을 맞댄 폭포 — Wikidata 항목은 전체 폭포군(3개)을 아우름
  { qid: 'Q34221', name: '나이아가라 폭포', aliases: ['Niagara Falls'], rarity: 'legendary', cheer: '굉음으로 쏟아지는 국경의 폭포를 마주했습니다' },
  { qid: 'Q351', name: '옐로스톤 국립공원', aliases: ['옐로스톤', 'Yellowstone National Park'], rarity: 'legendary', unesco: true, cheer: '세계 최초의 국립공원, 간헐천의 대지를 걸었습니다' },
  { qid: 'Q9188', name: '엠파이어 스테이트 빌딩', aliases: ['Empire State Building'], rarity: 'legendary', cheer: '뉴욕의 하늘을 가르는 아르데코의 첨탑에 올랐습니다' },
  { qid: 'Q390028', name: '독립기념관', aliases: ['인디펜던스 홀', 'Independence Hall'], rarity: 'legendary', unesco: true, cheer: '미국 독립선언이 울려퍼진 그 방에 닿았습니다' },
  { qid: 'Q172822', name: '후버댐', aliases: ['Hoover Dam'], rarity: 'legendary', cheer: '콜로라도 강을 가둔 거대한 콘크리트 장벽을 발견했습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q11259', name: '타임스스퀘어', aliases: ['타임스 스퀘어', 'Times Square'], rarity: 'epic', cheer: '네온이 밤을 밝히는 세계의 교차로에 섰습니다' },
  { qid: 'Q180376', name: '할리우드 사인', aliases: ['할리우드 표지판', 'Hollywood Sign'], rarity: 'epic', cheer: '언덕 위 하얀 글자, 영화의 도시를 발견했습니다' },
  { qid: 'Q745608', name: '라스베이거스 스트립', aliases: ['더 스트립', 'Las Vegas Strip'], rarity: 'epic', cheer: '불빛이 잠들지 않는 사막의 거리를 걸었습니다' },
  { qid: 'Q5317', name: '스페이스 니들', aliases: ['Space Needle'], rarity: 'epic', cheer: '우주시대를 꿈꾼 시애틀의 전망탑에 올랐습니다' },
  { qid: 'Q125006', name: '브루클린 브리지', aliases: ['브루클린 다리', 'Brooklyn Bridge'], rarity: 'epic', cheer: '이스트강을 가로지르는 고딕 케이블교를 건넜습니다' },
  { qid: 'Q1324340', name: '매직 킹덤', aliases: ['월트 디즈니 월드', 'Magic Kingdom', 'Walt Disney World'], rarity: 'epic', cheer: '동화 속 성이 기다리는 마법의 왕국에 입성했습니다' },
  { qid: 'Q181185', name: '디즈니랜드', aliases: ['디즈니랜드 파크', 'Disneyland', 'Disneyland Park'], rarity: 'epic', cheer: '미키마우스가 태어난 첫 번째 디즈니 왕국을 찾았습니다' },
  { qid: 'Q11245', name: '원 월드 트레이드 센터', aliases: ['프리덤 타워', 'One World Trade Center'], rarity: 'epic', cheer: '다시 솟아오른 자유의 첨탑을 발견했습니다' },
  { qid: 'Q29294', name: '윌리스 타워', aliases: ['시어스 타워', 'Willis Tower', 'Sears Tower'], rarity: 'epic', cheer: '시카고의 스카이라인을 지배하는 철탑에 올랐습니다' },
  { qid: 'Q2027162', name: '게이트웨이 아치', aliases: ['Gateway Arch'], rarity: 'epic', cheer: '서부로 향하는 관문, 은빛 아치를 지났습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q160409', name: '센트럴파크', aliases: ['센트럴 파크', 'Central Park'], rarity: 'rare', cheer: '빌딩숲 한가운데 펼쳐진 초록빛 쉼터를 발견했습니다' },
  { qid: 'Q160236', name: '메트로폴리탄 미술관', aliases: ['메트 뮤지엄', 'Metropolitan Museum of Art', 'The Met'], rarity: 'rare', cheer: '인류의 예술이 잠든 거대한 보물창고를 열었습니다' },
  { qid: 'Q213559', name: '링컨 기념관', aliases: ['Lincoln Memorial'], rarity: 'rare', cheer: '대리석 좌상 아래, 해방의 대통령을 마주했습니다' },
  { qid: 'Q178114', name: '워싱턴 기념탑', aliases: ['워싱턴 모뉴먼트', 'Washington Monument'], rarity: 'rare', cheer: '국립 몰 위로 솟은 하얀 오벨리스크를 발견했습니다' },
  { qid: 'Q54109', name: '미국 국회의사당', aliases: ['US 캐피톨', 'United States Capitol', 'US Capitol'], rarity: 'rare', cheer: '돔이 빛나는 미국 민주주의의 심장에 닿았습니다' },
  { qid: 'Q131354', name: '알카트라즈 섬', aliases: ['알카트라즈', 'Alcatraz Island'], rarity: 'rare', cheer: '탈출 불가의 전설, 감옥 섬에 발을 디뎠습니다' },
  { qid: 'Q1337576', name: '유니버설 스튜디오 할리우드', aliases: ['Universal Studios Hollywood'], rarity: 'rare', cheer: '영화 세트장 속으로 걸어 들어갔습니다' },
  { qid: 'Q1303805', name: '베니스 비치', aliases: ['베니스 해변', 'Venice Beach'], rarity: 'rare', cheer: '머슬비치의 활기, 캘리포니아의 해변을 걸었습니다' },
  { qid: 'Q3337338', name: '네이비 피어', aliases: ['Navy Pier'], rarity: 'rare', cheer: '호수 위로 뻗은 시카고의 놀이터를 발견했습니다' },
  { qid: 'Q1130516', name: '밀레니엄 파크', aliases: ['Millennium Park'], rarity: 'rare', cheer: '콩 모양 조형물이 반기는 도심 공원에 닿았습니다' },
  { qid: 'Q602939', name: '프렌치 쿼터', aliases: ['French Quarter'], rarity: 'rare', cheer: '재즈가 흐르는 뉴올리언스의 옛 거리를 거닐었습니다' },
  { qid: 'Q186106', name: '사우스 비치', aliases: ['South Beach'], rarity: 'rare', cheer: '파스텔빛 아르데코가 늘어선 마이애미 해변을 걸었습니다' },
  { qid: 'Q49131', name: '프리덤 트레일', aliases: ['자유의 길', 'Freedom Trail'], rarity: 'rare', cheer: '붉은 벽돌길을 따라 독립의 역사를 걸었습니다' },
  { qid: 'Q49137', name: '파뉴일 홀', aliases: ['패뉴일 홀', 'Faneuil Hall'], rarity: 'rare', cheer: '보스턴 자유의 요람, 옛 시장 건물을 발견했습니다' },
  { qid: 'Q1373418', name: '파이크 플레이스 마켓', aliases: ['Pike Place Market'], rarity: 'rare', cheer: '날아다니는 생선이 반기는 시애틀의 시장을 찾았습니다' },
  // 동명 함정 주의 — 'The Alamo' 검색 시 1836년 전투(Q235344)가 먼저 걸림. 실제 장소는 알라모 미션(건물)
  { qid: 'Q2636724', name: '알라모', aliases: ['알라모 미션', 'The Alamo', 'Alamo Mission'], rarity: 'rare', cheer: '텍사스 독립의 함성이 남은 옛 선교당을 마주했습니다' },
  { qid: 'Q1324280', name: '피셔맨스 워프', aliases: ["Fisherman's Wharf"], rarity: 'rare', cheer: '바다사자가 쉬어가는 샌프란시스코의 부두를 거닐었습니다' },
  { qid: 'Q71719', name: '할리우드 명예의 거리', aliases: ['할리우드 워크 오브 페임', 'Hollywood Walk of Fame'], rarity: 'rare', cheer: '별들의 이름이 새겨진 인도를 걸었습니다' },
  { qid: 'Q575901', name: '그리피스 천문대', aliases: ['Griffith Observatory'], rarity: 'rare', cheer: '로스앤젤레스의 야경을 품은 천문대에 올랐습니다' },
  { qid: 'Q1105882', name: '버번 스트리트', aliases: ['Bourbon Street'], rarity: 'rare', cheer: '재즈와 불빛이 넘실대는 프렌치 쿼터의 밤거리를 걸었습니다' },
];
