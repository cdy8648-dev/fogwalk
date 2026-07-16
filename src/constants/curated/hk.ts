import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇭🇰 홍콩 큐레이션 (35곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-16): P17=Q148(중국)·P131=Q8646(홍콩) 교차확인.
 */
export const HK_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q17541', name: '빅토리아 피크', aliases: ['太平山', 'Victoria Peak', 'The Peak'], rarity: 'legendary', cheer: '홍콩의 스카이라인을 굽어보는 정상에 올랐습니다' },
  { qid: 'Q155643', name: '빅토리아 하버', aliases: ['維多利亞港', 'Victoria Harbour'], rarity: 'legendary', cheer: '동양의 진주, 밤빛 물든 항구를 마주했습니다' },
  { qid: 'Q528079', name: '톈탄대불', aliases: ['天壇大佛', 'Tian Tan Buddha', 'Big Buddha', '天坛大佛'], rarity: 'legendary', cheer: '란타우의 구름 위, 청동 대불과 마주했습니다' },
  { qid: 'Q1041436', name: '보련선사', aliases: ['寶蓮禪寺', 'Po Lin Monastery'], rarity: 'legendary', cheer: '대불을 품은 향내 그윽한 산사를 깨웠습니다' },
  { qid: 'Q1116359', name: '웡타이신사원', aliases: ['黃大仙祠', 'Wong Tai Sin Temple', 'Sik Sik Yuen'], rarity: 'legendary', cheer: '소원을 이루어준다는 도교의 성지를 찾았습니다' },
  { qid: 'Q1859131', name: '스타페리', aliases: ['天星小輪', 'Star Ferry'], rarity: 'legendary', cheer: '백 년을 오간 초록빛 나룻배에 몸을 실었습니다' },
  { qid: 'Q717524', name: '만모사원', aliases: ['文武廟', 'Man Mo Temple', 'Sheung Wan Man Mo Temple', '東華三院文武廟'], rarity: 'legendary', cheer: '향연이 피어오르는 문무의 사당에 닿았습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q17704', name: '홍콩국제공항', aliases: ['香港國際機場', 'Hong Kong International Airport'], rarity: 'epic', cheer: '세계를 잇는 홍콩의 하늘길에 내려섰습니다' },
  { qid: 'Q317034', name: '국제상업센터', aliases: ['環球貿易廣場', 'International Commerce Centre', 'ICC'], rarity: 'epic', cheer: '구룡 하늘을 찌르는 홍콩 최고층 빌딩을 발견했습니다' },
  { qid: 'Q14226100', name: '국제금융센터', aliases: ['國際金融中心二期', 'Two International Finance Centre', 'IFC2', 'IFC'], rarity: 'epic', cheer: '홍콩섬 스카이라인의 은빛 첨탑을 마주했습니다' },
  { qid: 'Q605959', name: '홍콩 디즈니랜드', aliases: ['香港迪士尼樂園', 'Hong Kong Disneyland'], rarity: 'epic', cheer: '동양의 작은 마법 왕국에 입성했습니다' },
  { qid: 'Q1207908', name: '오션파크', aliases: ['香港海洋公園', 'Ocean Park'], rarity: 'epic', cheer: '산비탈 케이블카가 잇는 바다의 놀이터를 발견했습니다' },
  { qid: 'Q859404', name: '미드레벨 에스컬레이터', aliases: ['中環至半山自動扶手電梯系統', 'Central–Mid-Levels Escalator'], rarity: 'epic', cheer: '세계에서 가장 긴 야외 에스컬레이터를 올랐습니다' },
  { qid: 'Q1372014', name: 'HSBC 본사빌딩', aliases: ['香港滙豐總行大廈', 'HSBC Building', 'HSBC Main Building'], rarity: 'epic', cheer: '사자상이 지키는 금융가의 랜드마크를 발견했습니다' },
  { qid: 'Q782876', name: '스타의 거리', aliases: ['星光大道', 'Avenue of Stars'], rarity: 'epic', cheer: '스타들의 손도장이 새겨진 해변 산책로를 거닐었습니다' },
  { qid: 'Q5579185', name: '금자형광장', aliases: ['金紫荊廣場', 'Golden Bauhinia Square'], rarity: 'epic', cheer: '반환의 기억이 새겨진 황금빛 자형화를 마주했습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q7698673', name: '묘가', aliases: ['廟街', 'Temple Street'], rarity: 'rare', cheer: '점쟁이와 야시장이 뒤섞인 밤거리를 누볐습니다' },
  { qid: 'Q10942710', name: '여인가', aliases: ['女人街', "Ladies' Market"], rarity: 'rare', cheer: '흥정이 오가는 활기찬 야시장 골목을 걸었습니다' },
  { qid: 'Q7599773', name: '스탠리 마켓', aliases: ['赤柱市集', 'Stanley Market'], rarity: 'rare', cheer: '바닷바람 부는 남쪽 해변의 시장을 발견했습니다' },
  { qid: 'Q24437', name: '애버딘', aliases: ['香港仔', 'Aberdeen'], rarity: 'rare', cheer: '수상가옥이 떠 있는 어촌의 포구에 닿았습니다' },
  { qid: 'Q3124270', name: '란콰이퐁', aliases: ['蘭桂坊', 'Lan Kwai Fong'], rarity: 'rare', cheer: '밤이면 불이 켜지는 홍콩의 유흥가를 발견했습니다' },
  { qid: 'Q2188138', name: '네이던 로드', aliases: ['彌敦道', 'Nathan Road'], rarity: 'rare', cheer: '네온사인 가득한 구룡의 대로를 걸었습니다' },
  { qid: 'Q1984341', name: '옹핑360', aliases: ['昂坪360', 'Ngong Ping 360'], rarity: 'rare', cheer: '케이블카 너머 산과 바다의 절경을 만났습니다' },
  { qid: 'Q2918611', name: '홍콩공원', aliases: ['香港公園', 'Hong Kong Park'], rarity: 'rare', cheer: '빌딩 숲 사이 새장과 폭포가 있는 쉼터를 발견했습니다' },
  { qid: 'Q10879145', name: '구룡채성공원', aliases: ['九龍寨城公園', 'Kowloon Walled City Park'], rarity: 'rare', cheer: '무법의 성채가 있던 자리, 고요한 정원을 거닐었습니다' },
  { qid: 'Q137563', name: '청차우', aliases: ['長洲', 'Cheung Chau'], rarity: 'rare', cheer: '만두 모양 섬, 평화로운 어촌을 찾았습니다' },
  { qid: 'Q931179', name: '람마섬', aliases: ['南丫島', 'Lamma Island'], rarity: 'rare', cheer: '차 없는 섬, 해산물 향기 가득한 포구를 걸었습니다' },
  { qid: 'Q502379', name: '란타우섬', aliases: ['大嶼山', 'Lantau Island'], rarity: 'rare', cheer: '홍콩에서 가장 큰 섬, 대불과 공항을 품은 땅에 닿았습니다' },
  { qid: 'Q2497224', name: '타이오', aliases: ['大澳', 'Tai O'], rarity: 'rare', cheer: '수상가옥이 늘어선 홍콩의 베니스를 발견했습니다' },
  { qid: 'Q1652985', name: '피크트램', aliases: ['山頂纜車', 'Peak Tram'], rarity: 'rare', cheer: '가파른 궤도를 오르는 홍콩 최고령 열차에 올랐습니다' },
  { qid: 'Q692288', name: '침사추이 시계탑', aliases: ['尖沙咀鐘樓', 'Clock Tower'], rarity: 'rare', cheer: '옛 기차역의 마지막 흔적, 시계탑을 마주했습니다' },
  { qid: 'Q1626931', name: '홍콩역사박물관', aliases: ['香港歷史博物館', 'Hong Kong Museum of History'], rarity: 'rare', cheer: '어촌에서 국제도시까지, 홍콩의 시간을 만났습니다' },
  { qid: 'Q1144740', name: '홍콩우주박물관', aliases: ['香港太空館', 'Hong Kong Space Museum'], rarity: 'rare', cheer: '은빛 돔 아래 우주로의 여정을 시작했습니다' },
  { qid: 'Q1859090', name: '빅토리아 공원', aliases: ['維多利亞公園', 'Victoria Park'], rarity: 'rare', cheer: '코즈웨이베이 한복판, 도심의 녹색 쉼터를 발견했습니다' },
  { qid: 'Q220207', name: '홍콩동식물원', aliases: ['香港動植物公園', 'Hong Kong Zoological and Botanical Gardens'], rarity: 'rare', cheer: '홍콩에서 가장 오래된 식물원의 그늘을 거닐었습니다' },
];
