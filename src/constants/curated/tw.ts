import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇹🇼 대만 큐레이션 (31곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-06): P17=Q865 교차확인.
 * 대만은 유네스코 세계유산 등재국이 아니므로(UN 비회원) unesco 플래그 없음.
 */
export const TW_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q540668', name: '국립고궁박물원', aliases: ['國立故宮博物院', '고궁박물원', 'National Palace Museum'], rarity: 'legendary', cheer: '천하제일의 보물을 품은 박물관을 발견했습니다' },
  { qid: 'Q706761', name: '용산사', aliases: ['艋舺龍山寺', '龍山寺', 'Lungshan Temple', '방카용산사'], rarity: 'legendary', cheer: '만화 거리를 지켜온 관음보살의 사찰을 깨웠습니다' },
  { qid: 'Q540794', name: '중정기념당', aliases: ['中正紀念堂', 'Chiang Kai-shek Memorial Hall', '장개석기념당'], rarity: 'legendary', cheer: '흰 벽과 청기와, 타이베이의 기념전당에 닿았습니다' },
  { qid: 'Q716932', name: '예류지질공원', aliases: ['野柳地質公園', 'Yehliu Geopark', '예류풍경특정구'], rarity: 'legendary', cheer: '여왕의 머리를 닮은 기암을 발견했습니다' },
  { qid: 'Q707427', name: '타이루거 국가공원', aliases: ['太魯閣國家公園', 'Taroko National Park', '타이루거협곡'], rarity: 'legendary', cheer: '대리석 협곡을 가르는 계곡물 소리에 닿았습니다' },
  { qid: 'Q707585', name: '아리산', aliases: ['阿里山', 'Alishan', '아리산국가풍경구'], rarity: 'legendary', cheer: '운해 위로 떠오르는 아리산의 해돋이를 만났습니다' },
  { qid: 'Q500275', name: '위산', aliases: ['玉山', 'Yushan', 'Jade Mountain', '옥산'], rarity: 'legendary', cheer: '동북아 최고봉, 옥빛 봉우리에 올랐습니다' },
  { qid: 'Q31093', name: '지우펀', aliases: ['九份', 'Jiufen'], rarity: 'legendary', cheer: '홍등이 물드는 산비탈의 옛 거리를 걸었습니다' },
  { qid: 'Q716206', name: '르웨탄', aliases: ['日月潭', 'Sun Moon Lake', '일월담'], rarity: 'legendary', cheer: '해와 달을 품은 대만 제일의 호수를 마주했습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q83101', name: '타이베이101', aliases: ['台北101', 'Taipei 101'], rarity: 'epic', cheer: '폭죽처럼 솟아오른 대만 최고층 빌딩을 발견했습니다' },
  { qid: 'Q55601', name: '총통부', aliases: ['總統府', 'Presidential Office Building'], rarity: 'epic', cheer: '붉은 벽돌의 권부, 대만 정치의 심장에 닿았습니다' },
  { qid: 'Q63227', name: '시먼딩', aliases: ['西門町', 'Ximending'], rarity: 'epic', cheer: '타이베이 젊음이 모이는 거리를 거닐었습니다' },
  { qid: 'Q697118', name: '스린 야시장', aliases: ['士林夜市', 'Shilin Night Market'], rarity: 'epic', cheer: '대만 최대 야시장의 불빛과 냄새를 만끽했습니다' },
  { qid: 'Q570509', name: '단수이', aliases: ['淡水', 'Tamsui'], rarity: 'epic', cheer: '강과 바다가 만나는 노을의 마을에 닿았습니다' },
  { qid: 'Q337631', name: '가오슝85빌딩', aliases: ['高雄85大樓', 'Tuntex Sky Tower', '퉁텍스타워'], rarity: 'epic', cheer: '남대만의 하늘을 찌르는 탑을 발견했습니다' },
  { qid: 'Q555332', name: '국가양청원', aliases: ['國家兩廳院', 'National Theater and Concert Hall'], rarity: 'epic', cheer: '패루 너머 예술의 전당을 발견했습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q697314', name: '국부기념관', aliases: ['國父紀念館', 'Sun Yat-sen Memorial Hall'], rarity: 'rare', cheer: '건국의 아버지를 기리는 전당에 섰습니다' },
  { qid: 'Q707982', name: '컨딩 국가공원', aliases: ['墾丁國家公園', 'Kenting National Park', '컨딩'], rarity: 'rare', cheer: '대만 최남단의 열대 해변에 닿았습니다' },
  { qid: 'Q697957', name: '아이허', aliases: ['愛河', 'Ai River', '사랑의 강'], rarity: 'rare', cheer: '가오슝의 밤을 물들이는 사랑의 강을 걸었습니다' },
  { qid: 'Q548694', name: '불광산', aliases: ['佛光山', 'Fo Guang Shan'], rarity: 'rare', cheer: '거대한 불상이 굽어보는 불교 성지를 찾았습니다' },
  { qid: 'Q20706255', name: '안핑고보', aliases: ['安平古堡', 'Fort Zeelandia', '질란디아요새'], rarity: 'rare', cheer: '네덜란드가 남긴 타이난의 옛 성채를 발견했습니다' },
  { qid: 'Q714431', name: '츠칸러우', aliases: ['赤崁樓', 'Fort Provintia', '프로빈시아요새'], rarity: 'rare', cheer: '타이난 역사의 첫 페이지, 붉은 누각에 닿았습니다' },
  { qid: 'Q706692', name: '국립대만박물관', aliases: ['國立臺灣博物館', 'National Taiwan Museum'], rarity: 'rare', cheer: '대만에서 가장 오래된 박물관을 발견했습니다' },
  { qid: 'Q555338', name: '타이중 국가가극원', aliases: ['臺中國家歌劇院', 'Taichung Metropolitan Opera House'], rarity: 'rare', cheer: '물결치는 곡선의 오페라하우스를 발견했습니다' },
  { qid: 'Q848911', name: '펑자 야시장', aliases: ['逢甲夜市', 'Fengjia Night Market'], rarity: 'rare', cheer: '타이중 대학가의 활기찬 야시장을 거닐었습니다' },
  { qid: 'Q28410361', name: '스펀', aliases: ['十分', 'Shifen', '십분료', '십분폭포'], rarity: 'rare', cheer: '하늘로 날아오르는 소원등을 띄웠습니다' },
  { qid: 'Q16926656', name: '시토우 자연교육원', aliases: ['溪頭自然教育園區', 'Xitou Nature Education Area'], rarity: 'rare', cheer: '삼나무 숲의 짚와이어, 시토우의 숲길을 걸었습니다' },
  { qid: 'Q707622', name: '라오허제 야시장', aliases: ['饒河街觀光夜市', 'Raohe Street Night Market'], rarity: 'rare', cheer: '패루 아래 타이베이 동부의 야시장을 누볐습니다' },
  { qid: 'Q16890300', name: '치싱탄 해변', aliases: ['七星潭', 'Chihsingtan Beach'], rarity: 'rare', cheer: '몽돌 해변 너머 화롄의 파도소리를 들었습니다' },
  { qid: 'Q198525', name: '펑후현', aliases: ['澎湖縣', 'Penghu'], rarity: 'rare', cheer: '옥빛 바다에 흩어진 펑후의 섬들을 찾았습니다' },
  { qid: 'Q249870', name: '진먼현', aliases: ['金門縣', 'Kinmen'], rarity: 'rare', cheer: '포탄으로 벼린 진먼의 식칼 전설을 발견했습니다' },
];
