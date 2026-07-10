import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇻🇳 베트남 큐레이션 (34곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-10): P17=Q881 교차확인.
 */
export const VN_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q190128', name: '하롱베이', aliases: ['Vịnh Hạ Long', 'Ha Long Bay'], rarity: 'legendary', unesco: true, cheer: '삼천 개 섬이 떠오른 에메랄드 바다를 발견했습니다' },
  { qid: 'Q1151254', name: '호안끼엠 호수', aliases: ['Hồ Hoàn Kiếm', 'Hoan Kiem Lake', '거북 호수'], rarity: 'legendary', cheer: '전설의 검이 잠긴 하노이의 심장에 닿았습니다' },
  { qid: 'Q1202019', name: '반미에우', aliases: ['문묘', 'Văn Miếu – Quốc Tử Giám', 'Temple of Literature'], rarity: 'legendary', cheer: '베트남 최초의 국립대학, 학문의 성소를 거닐었습니다' },
  { qid: 'Q874234', name: '호치민 묘', aliases: ['Lăng Chủ tịch Hồ Chí Minh', 'Ho Chi Minh Mausoleum'], rarity: 'legendary', cheer: '베트남 국부가 잠든 화강암 영묘 앞에 섰습니다' },
  { qid: 'Q1186292', name: '일주사원', aliases: ['못꼿 사원', 'Chùa Một Cột', 'One Pillar Pagoda'], rarity: 'legendary', cheer: '연꽃처럼 홀로 선 하나의 기둥 사원을 발견했습니다' },
  { qid: 'Q10769129', name: '후에 왕궁', aliases: ['다이노이', '후에성', 'Đại Nội Huế', 'Imperial City of Huế'], rarity: 'legendary', unesco: true, cheer: '응우옌 왕조의 자금성, 그 안뜰에 닿았습니다' },
  { qid: 'Q5965459', name: '호이안 고대마을', aliases: ['Phố cổ Hội An', 'Hoi An Ancient Town'], rarity: 'legendary', unesco: true, cheer: '등불이 물드는 옛 무역항의 골목을 걸었습니다' },
  { qid: 'Q391406', name: '미썬 성지', aliases: ['미선 유적', 'Thánh địa Mỹ Sơn', 'My Son Sanctuary'], rarity: 'legendary', unesco: true, cheer: '참파 왕국이 남긴 붉은 벽돌 탑들을 발견했습니다' },
  { qid: 'Q23513', name: '퐁냐케방 국립공원', aliases: ['퐁나케방 국립공원', 'Vườn quốc gia Phong Nha-Kẻ Bàng', 'Phong Nha-Ke Bang'], rarity: 'legendary', unesco: true, cheer: '지구에서 가장 오래된 카르스트 동굴에 발을 들였습니다' },
  { qid: 'Q123782', name: '판시판산', aliases: ['판시팡산', 'Phan Xi Păng', 'Fansipan'], rarity: 'legendary', cheer: '인도차이나의 지붕, 그 정상에 올랐습니다' },
  { qid: 'Q206219', name: '탕롱황성', aliases: ['탕롱 왕궁', 'Hoàng thành Thăng Long', 'Imperial Citadel of Thăng Long'], rarity: 'legendary', unesco: true, cheer: '천 년 하노이의 뿌리, 옛 왕성터를 발견했습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q18640924', name: '랜드마크81', aliases: ['Landmark 81'], rarity: 'epic', cheer: '베트남에서 가장 높은 탑, 그 정상을 밝혔습니다' },
  { qid: 'Q638512', name: '비텍스코 파이낸셜 타워', aliases: ['Bitexco Financial Tower'], rarity: 'epic', cheer: '연꽃을 닮은 사이공의 마천루를 발견했습니다' },
  { qid: 'Q428129', name: '사이공 노트르담 대성당', aliases: ['Nhà thờ Đức Bà Sài Gòn', 'Saigon Notre-Dame Cathedral'], rarity: 'epic', cheer: '프랑스 붉은 벽돌이 쌓아올린 성당에 닿았습니다' },
  { qid: 'Q2227270', name: '사이공 중앙우체국', aliases: ['Bưu điện trung tâm Sài Gòn', 'Saigon Central Post Office'], rarity: 'epic', cheer: '식민시대의 흔적이 남은 아치형 우체국을 발견했습니다' },
  { qid: 'Q933384', name: '독립궁', aliases: ['통일궁', 'Dinh Độc Lập', 'Reunification Palace', 'Independence Palace'], rarity: 'epic', cheer: '탱크가 문을 부순 전쟁의 마지막 장면 앞에 섰습니다' },
  { qid: 'Q192721', name: '구찌터널', aliases: ['꾸찌 터널', 'Địa đạo Củ Chi', 'Cu Chi Tunnels'], rarity: 'epic', cheer: '땅 밑에 숨겨진 저항의 미로를 탐험했습니다' },
  { qid: 'Q1186043', name: '하노이 오페라하우스', aliases: ['Nhà hát Lớn Hà Nội', 'Hanoi Opera House'], rarity: 'epic', cheer: '파리를 옮겨놓은 듯한 극장 앞에 닿았습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q2227195', name: '호치민 시청사', aliases: ['호찌민 시청', 'Trụ sở UBND Thành phố Hồ Chí Minh', 'Ho Chi Minh City Hall'], rarity: 'rare', cheer: '프랑스풍 파사드의 시청 건물을 발견했습니다' },
  { qid: 'Q3232879', name: '벤탄시장', aliases: ['벤타인 시장', 'Chợ Bến Thành', 'Ben Thanh Market'], rarity: 'rare', cheer: '시계탑이 지키는 사이공의 옛 시장을 누볐습니다' },
  { qid: 'Q7395483', name: '사파', aliases: ['사빠', 'Sa Pa', 'Sapa'], rarity: 'rare', cheer: '구름 위 다랑논이 펼쳐진 고산 마을에 닿았습니다' },
  { qid: 'Q1406000', name: '땀꼭', aliases: ['땀꼭-빅동', 'Tam Cốc', 'Tam Coc-Bich Dong'], rarity: 'rare', cheer: '뭍 위의 하롱베이, 강물 위 배를 저었습니다' },
  { qid: 'Q10810559', name: '짱안 경관단지', aliases: ['Quần thể danh thắng Tràng An', 'Trang An Landscape Complex'], rarity: 'rare', unesco: true, cheer: '석회암 봉우리 사이 뱃길을 따라 흘러갔습니다' },
  { qid: 'Q5305270', name: '용다리', aliases: ['롱교', 'Cầu Rồng', 'Dragon Bridge'], rarity: 'rare', cheer: '불을 뿜는 다낭의 황금 용다리를 건넜습니다' },
  { qid: 'Q55954790', name: '골든브릿지', aliases: ['방교', 'Cầu Vàng', 'Golden Bridge', 'Bà Nà Hills'], rarity: 'rare', cheer: '거대한 두 손이 떠받든 구름 위 다리를 찾았습니다' },
  { qid: 'Q10796763', name: '미케비치', aliases: ['미케 해변', 'Bãi biển Mỹ Khê', 'My Khe Beach'], rarity: 'rare', cheer: '세계가 인정한 다낭의 은빛 해변에 닿았습니다' },
  { qid: 'Q600269', name: '포나가르 참탑', aliases: ['포 나가', 'Tháp Bà Ponagar', 'Po Nagar'], rarity: 'rare', cheer: '참파 여신을 모신 붉은 벽돌 탑을 발견했습니다' },
  { qid: 'Q2527182', name: '빈펄 케이블카', aliases: ['Vinpearl Cable Car', '빈펄랜드', 'Vinpearl Land Nha Trang'], rarity: 'rare', cheer: '바다를 가로지르는 세계 최장급 케이블카를 탔습니다' },
  { qid: 'Q1171693', name: '크레이지하우스', aliases: ['항응아 게스트하우스', 'Crazy House', 'Hằng Nga Guesthouse'], rarity: 'rare', cheer: '나무뿌리를 닮은 기묘한 건축물 속을 헤맸습니다' },
  { qid: 'Q48078466', name: '혼똠 케이블카', aliases: ['Hòn Thơm cable car', '푸꾸옥 케이블카', 'VinWonders Phú Quốc'], rarity: 'rare', cheer: '바다 위를 나는 세계 최장 해상 케이블카를 탔습니다' },
  { qid: 'Q10748803', name: '까이랑 수상시장', aliases: ['Cái Răng Floating Market', 'Chợ nổi Cái Răng'], rarity: 'rare', cheer: '메콩강 위에 펼쳐진 배들의 시장을 구경했습니다' },
  { qid: 'Q703871', name: '전쟁증적박물관', aliases: ['War Remnants Museum', 'Bảo tàng Chứng tích Chiến tranh'], rarity: 'rare', cheer: '전쟁의 상흔을 기록한 박물관에 닿았습니다' },
  { qid: 'Q1949129', name: '사이공 오페라하우스', aliases: ['호찌민 시립 극장', 'Nhà hát Thành phố Hồ Chí Minh', 'Saigon Opera House'], rarity: 'rare', cheer: '벨 에포크 시대의 극장 앞에 섰습니다' },
  { qid: 'Q85788921', name: '하노이 기찻길 마을', aliases: ['Hanoi Train Street'], rarity: 'rare', cheer: '처마 끝을 스치는 기차가 지나는 골목을 찾았습니다' },
  // QID 미확보(검색 결과가 동명의 게스트하우스로 오매칭됨, 지역 자체는 항목 없음) — 이름 폴백
  { qid: null, name: '하노이 구시가', aliases: ['Phố cổ Hà Nội', 'Hanoi Old Quarter', '36 Phố Phường'], rarity: 'rare', cheer: '서른여섯 개 골목의 옛 하노이를 거닐었습니다' },
];
