import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇯🇵 일본 큐레이션 (37곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-04): P17=Q17 교차확인.
 */
export const JP_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q615183', name: '센소지', aliases: ['浅草寺', 'Sensoji', 'Sensō-ji'], rarity: 'legendary', cheer: '천 년 도쿄를 지켜온 아사쿠사의 사찰을 깨웠습니다' },
  { qid: 'Q714828', name: '후시미이나리타이샤', aliases: ['伏見稲荷大社', 'Fushimi Inari Taisha', '후시미 이나리 신사'], rarity: 'legendary', cheer: '천 개의 붉은 도리이를 지나 여우신의 성역에 닿았습니다' },
  { qid: 'Q39231', name: '후지산', aliases: ['富士山', 'Mount Fuji', 'Mt. Fuji'], rarity: 'legendary', unesco: true, cheer: '일본 열도가 우러르는 영봉의 정상에 올랐습니다' },
  { qid: 'Q221716', name: '기요미즈데라', aliases: ['清水寺', 'Kiyomizu-dera'], rarity: 'legendary', unesco: true, cheer: '무대 위에서 교토의 전경을 굽어보았습니다' },
  { qid: 'Q270983', name: '킨카쿠지', aliases: ['金閣寺', '금각사', 'Kinkaku-ji'], rarity: 'legendary', unesco: true, cheer: '금빛으로 빛나는 연못 위 누각을 발견했습니다' },
  { qid: 'Q188754', name: '히메지성', aliases: ['姫路城', 'Himeji Castle'], rarity: 'legendary', unesco: true, cheer: '백로가 날아오르는 듯한 흰 성을 마주했습니다' },
  { qid: 'Q191763', name: '이쓰쿠시마 신사', aliases: ['厳島神社', 'Itsukushima Shrine', '엄도신사'], rarity: 'legendary', unesco: true, cheer: '바다 위에 뜬 붉은 도리이를 발견했습니다' },
  { qid: 'Q460367', name: '도다이지', aliases: ['東大寺', '동대사', 'Todai-ji'], rarity: 'legendary', unesco: true, cheer: '거대한 대불이 잠든 나라의 고찰에 닿았습니다' },
  { qid: 'Q696362', name: '이즈모타이샤', aliases: ['出雲大社', 'Izumo Taisha', '이즈모대사'], rarity: 'legendary', cheer: '인연을 맺어주는 태고의 신사를 찾았습니다' },
  { qid: 'Q287165', name: '메이지진구', aliases: ['明治神宮', 'Meiji Jingu', '메이지신궁'], rarity: 'legendary', cheer: '울창한 숲 속 도쿄의 큰 신궁에 닿았습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q183536', name: '도쿄타워', aliases: ['東京タワー', 'Tokyo Tower'], rarity: 'epic', cheer: '붉은 철탑, 쇼와의 상징을 밝혔습니다' },
  { qid: 'Q57965', name: '도쿄스카이트리', aliases: ['東京スカイツリー', 'Tokyo Skytree'], rarity: 'epic', cheer: '하늘을 찌르는 일본 최고봉의 전망대에 올랐습니다' },
  { qid: 'Q21083961', name: '시부야 스크램블 교차로', aliases: ['渋谷スクランブル交差点', 'Shibuya Crossing', 'Shibuya Scramble Crossing'], rarity: 'epic', cheer: '수백의 발걸음이 교차하는 도쿄의 심장을 건넜습니다' },
  { qid: 'Q321242', name: '오사카성', aliases: ['大阪城', 'Osaka Castle'], rarity: 'epic', cheer: '황금 샤치호코가 빛나는 오사카의 성을 발견했습니다' },
  { qid: 'Q964876', name: '도톤보리', aliases: ['道頓堀', 'Dotonbori'], rarity: 'epic', cheer: '글리코 간판 아래 오사카의 밤을 만끽했습니다' },
  { qid: 'Q1148463', name: '쓰텐카쿠', aliases: ['通天閣', 'Tsutenkaku'], rarity: 'epic', cheer: '오사카 서민의 정서가 깃든 전망탑을 발견했습니다' },
  { qid: 'Q843997', name: '도쿄 디즈니랜드', aliases: ['東京ディズニーランド', 'Tokyo Disneyland'], rarity: 'epic', cheer: '꿈과 마법의 왕국에 입성했습니다' },
  { qid: 'Q1375103', name: '유니버설 스튜디오 재팬', aliases: ['ユニバーサル・スタジオ・ジャパン', 'USJ', 'Universal Studios Japan'], rarity: 'epic', cheer: '영화 속 세상으로 걸어 들어갔습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  // 검색 시 에도성(Q865913)이 먼저 걸리는 함정 주의 — 실제 참배지는 고쿄(Q500681)
  { qid: 'Q500681', name: '고쿄', aliases: ['皇居', 'Tokyo Imperial Palace'], rarity: 'rare', cheer: '천황이 거하는 고요한 궁을 마주했습니다' },
  { qid: 'Q283196', name: '도쿄역', aliases: ['東京駅', 'Tokyo Station'], rarity: 'rare', cheer: '붉은 벽돌의 관문, 도쿄의 현관을 지났습니다' },
  { qid: 'Q5368576', name: '오다이바 해변공원', aliases: ['お台場海浜公園', 'Odaiba Marine Park', '오다이바'], rarity: 'rare', cheer: '레인보우 브리지가 보이는 해변에 닿았습니다' },
  { qid: 'Q746216', name: '우에노 공원', aliases: ['上野恩賜公園', 'Ueno Park'], rarity: 'rare', cheer: '벚꽃과 박물관이 어우러진 도쿄의 정원을 거닐었습니다' },
  { qid: 'Q776863', name: '신주쿠 교엔', aliases: ['新宿御苑', 'Shinjuku Gyoen'], rarity: 'rare', cheer: '고층빌딩 사이 고요한 정원을 발견했습니다' },
  { qid: 'Q1071084', name: '롯폰기 힐스', aliases: ['六本木ヒルズ', 'Roppongi Hills'], rarity: 'rare', cheer: '거미 조각상이 지키는 도쿄의 신도심에 닿았습니다' },
  { qid: 'Q2859566', name: '아라시야마', aliases: ['嵐山', 'Arashiyama'], rarity: 'rare', cheer: '하늘을 가린 대나무숲의 길을 걸었습니다' },
  { qid: 'Q926312', name: '기온', aliases: ['祇園', 'Gion'], rarity: 'rare', cheer: '게이샤의 발소리가 남은 옛 거리를 거닐었습니다' },
  { qid: 'Q257473', name: '긴카쿠지', aliases: ['銀閣寺', '은각사', 'Ginkaku-ji'], rarity: 'rare', unesco: true, cheer: '은빛을 꿈꾼 고즈넉한 누각을 발견했습니다' },
  { qid: 'Q1013399', name: '니조성', aliases: ['二条城', 'Nijo Castle'], rarity: 'rare', unesco: true, cheer: '휘파람새 마루가 우는 쇼군의 성을 걸었습니다' },
  { qid: 'Q998239', name: '겐로쿠엔', aliases: ['兼六園', 'Kenrokuen'], rarity: 'rare', cheer: '일본 3대 정원 중 하나를 거닐었습니다' },
  { qid: 'Q648629', name: '나고야성', aliases: ['名古屋城', 'Nagoya Castle'], rarity: 'rare', cheer: '금빛 샤치호코가 지키는 나고야의 성을 발견했습니다' },
  { qid: 'Q907052', name: '슈리성', aliases: ['首里城', 'Shuri Castle'], rarity: 'rare', unesco: true, cheer: '류큐 왕국의 붉은 성터를 마주했습니다' },
  { qid: 'Q231140', name: '원폭돔', aliases: ['原爆ドーム', 'Genbaku Dome', 'Hiroshima Peace Memorial', '히로시마 평화기념관'], rarity: 'rare', unesco: true, cheer: '평화를 기리는 히로시마의 돔에 닿았습니다' },
  { qid: 'Q696641', name: '닛코 도쇼구', aliases: ['日光東照宮', 'Nikko Toshogu'], rarity: 'rare', unesco: true, cheer: '보지도 듣지도 말하지도 않는 원숭이를 만났습니다' },
  { qid: 'Q710786', name: '다자이후 텐만구', aliases: ['太宰府天満宮', 'Dazaifu Tenmangu'], rarity: 'rare', cheer: '학문의 신을 모신 매화 향 가득한 신사를 찾았습니다' },
  { qid: 'Q1140619', name: '삿포로 시계탑', aliases: ['札幌時計台', 'Sapporo Clock Tower'], rarity: 'rare', cheer: '홋카이도 개척시대의 시계탑을 발견했습니다' },
  { qid: 'Q1196357', name: '고료카쿠', aliases: ['五稜郭', 'Goryokaku'], rarity: 'rare', cheer: '별 모양의 요새, 하코다테의 성터를 발견했습니다' },
  { qid: 'Q1186358', name: '나라 공원', aliases: ['奈良公園', 'Nara Park'], rarity: 'rare', cheer: '사슴이 뛰노는 옛 도읍의 공원을 거닐었습니다' },
];
