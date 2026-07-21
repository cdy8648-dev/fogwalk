import type { CuratedLandmark } from '../curatedLandmarks';

/**
 * 🇫🇷 프랑스 큐레이션 (37곳).
 * QID는 Wikidata API 실조회로 검증됨(2026-07-21): P17=Q142 교차확인.
 */
export const FR_CURATED: CuratedLandmark[] = [
  // ═══════════ 전설 (LEGENDARY) — 국가 최상징 · 1000XP ═══════════
  { qid: 'Q243', name: '에펠탑', aliases: ['Tour Eiffel', 'Eiffel Tower'], rarity: 'legendary', cheer: '파리의 하늘을 가르는 철의 탑을 발견했습니다' },
  { qid: 'Q2981', name: '노트르담 대성당', aliases: ['Notre-Dame de Paris', 'Cathédrale Notre-Dame de Paris'], rarity: 'legendary', cheer: '센강 위에 우뚝 선 고딕의 걸작을 마주했습니다' },
  { qid: 'Q64436', name: '개선문', aliases: ["Arc de Triomphe", "Arc de Triomphe de l'Étoile"], rarity: 'legendary', cheer: '샹젤리제 끝에서 승리의 문을 올려다보았습니다' },
  { qid: 'Q19675', name: '루브르 박물관', aliases: ['Musée du Louvre', 'Louvre'], rarity: 'legendary', cheer: '유리 피라미드 아래, 세계 최대의 보물창고를 열었습니다' },
  { qid: 'Q28785', name: '사크레쾨르 대성당', aliases: ['Basilique du Sacré-Cœur', 'Sacré-Cœur de Montmartre'], rarity: 'legendary', cheer: '몽마르트 언덕 위 하얀 성심의 성당을 발견했습니다' },
  { qid: 'Q20883', name: '몽생미셸', aliases: ['Mont-Saint-Michel', 'Mont Saint-Michel'], rarity: 'legendary', unesco: true, cheer: '밀물이 감싸는 바다 위 수도원 섬을 발견했습니다' },
  { qid: 'Q2946', name: '베르사유 궁전', aliases: ['Château de Versailles', 'Palace of Versailles'], rarity: 'legendary', unesco: true, cheer: '태양왕이 세운 화려한 궁전의 정원에 섰습니다' },
  { qid: 'Q205367', name: '샹보르 성', aliases: ['Château de Chambord'], rarity: 'legendary', unesco: true, cheer: '루아르 강가, 이중나선 계단의 성을 깨웠습니다' },
  { qid: 'Q143463', name: '교황청 궁전', aliases: ['Palais des Papes', 'Palace of the Popes'], rarity: 'legendary', unesco: true, cheer: '아비뇽의 다리 곁, 중세 교황의 성채를 마주했습니다' },
  { qid: 'Q389269', name: '카르카손 성채도시', aliases: ['Cité de Carcassonne'], rarity: 'legendary', unesco: true, cheer: '이중 성벽에 둘러싸인 중세의 성채도시를 발견했습니다' },

  // ═══════════ 영웅 (EPIC) — 국가적 현대 상징 · 500XP ═══════════
  { qid: 'Q323767', name: '몽파르나스 타워', aliases: ['Tour Montparnasse'], rarity: 'epic', cheer: '파리 스카이라인의 검은 마천루를 발견했습니다' },
  { qid: 'Q216357', name: '라 데팡스 대개선문', aliases: ['Grande Arche', 'Grande Arche de la Défense', 'Arche de la Défense'], rarity: 'epic', cheer: '현대 파리의 관문, 거대한 대개선문 앞에 섰습니다' },
  { qid: 'Q13205', name: '스타드 드 프랑스', aliases: ['Stade de France'], rarity: 'epic', cheer: '월드컵의 함성이 울려퍼진 국립경기장에 닿았습니다' },
  { qid: 'Q206521', name: '디즈니랜드 파리', aliases: ['Disneyland Paris'], rarity: 'epic', cheer: '유럽 속 꿈과 마법의 왕국에 입성했습니다' },
  { qid: 'Q99236', name: '미요 대교', aliases: ['Viaduc de Millau', 'Millau Viaduct'], rarity: 'epic', cheer: '구름 위를 가르는 세계 최고 높이의 다리를 건넜습니다' },
  { qid: 'Q178065', name: '퐁피두 센터', aliases: ['Centre Pompidou', 'Centre Georges-Pompidou'], rarity: 'epic', cheer: '파이프와 철골이 드러난 파격의 미술관을 발견했습니다' },
  { qid: 'Q583', name: '몽블랑', aliases: ['Mont Blanc'], rarity: 'epic', cheer: '서유럽 최고봉, 만년설의 정상을 마주했습니다' },

  // ═══════════ 희귀 (RARE) — 광역/도시 대표 명소 · 250XP ═══════════
  { qid: 'Q193215', name: '슈농소 성', aliases: ['Château de Chenonceau'], rarity: 'rare', cheer: '강물 위에 떠 있는 듯한 여인들의 성을 발견했습니다' },
  { qid: 'Q437959', name: '마르세유 구항', aliases: ['Vieux-Port de Marseille', 'Vieux-Port'], rarity: 'rare', cheer: '지중해의 햇살이 머무는 옛 항구에 닿았습니다' },
  { qid: 'Q1516', name: '푸르비에르 성당', aliases: ['Basilique Notre-Dame de Fourvière', 'Fourvière'], rarity: 'rare', cheer: '리옹을 굽어보는 언덕 위 성당을 발견했습니다' },
  { qid: 'Q614', name: '벨쿠르 광장', aliases: ['Place Bellecour'], rarity: 'rare', cheer: '리옹 도심 한복판의 너른 광장에 섰습니다' },
  { qid: 'Q1849491', name: '영국인의 산책로', aliases: ['Promenade des Anglais'], rarity: 'rare', cheer: '니스의 푸른 해안을 따라 걸었습니다' },
  { qid: 'Q3558059', name: '니스 구시가', aliases: ['Vieux Nice', 'Vieux-Nice'], rarity: 'rare', cheer: '파스텔빛 골목이 이어지는 니스의 구시가를 거닐었습니다' },
  { qid: 'Q3390346', name: '보르도 증권거래소 광장', aliases: ['Place de la Bourse'], rarity: 'rare', cheer: '가론강에 비친 18세기 광장을 발견했습니다' },
  { qid: 'Q745460', name: '스트라스부르 대성당', aliases: ['Cathédrale Notre-Dame de Strasbourg'], rarity: 'rare', cheer: '장밋빛 사암으로 쌓아올린 첨탑을 올려다보았습니다' },
  { qid: 'Q965606', name: '프티트 프랑스', aliases: ['Petite France'], rarity: 'rare', cheer: '운하가 흐르는 스트라스부르의 옛 마을을 거닐었습니다' },
  { qid: 'Q2351013', name: '카피톨 광장', aliases: ['Capitole de Toulouse', 'Place du Capitole'], rarity: 'rare', cheer: '장밋빛 도시 툴루즈의 심장부에 닿았습니다' },
  { qid: 'Q1289258', name: '브르타뉴 공작성', aliases: ['Château des ducs de Bretagne'], rarity: 'rare', cheer: '낭트의 옛 공작들이 거닐던 성을 발견했습니다' },
  { qid: 'Q3558054', name: '릴 구시가', aliases: ['Vieux-Lille'], rarity: 'rare', cheer: '플랑드르풍 건물이 늘어선 릴의 구시가를 거닐었습니다' },
  { qid: 'Q2455184', name: '크루아제트 거리', aliases: ['La Croisette', 'Promenade de la Croisette'], rarity: 'rare', cheer: '칸 영화제의 붉은 카펫이 스치는 해변길을 걸었습니다' },
  { qid: 'Q83236', name: '샤모니몽블랑', aliases: ['Chamonix-Mont-Blanc', 'Chamonix'], rarity: 'rare', cheer: '알프스 등반의 출발점, 산악마을에 닿았습니다' },
  { qid: 'Q3377391', name: '콜마르 프티트 베니스', aliases: ['Petite Venise', 'La Petite Venise de Colmar'], rarity: 'rare', cheer: '동화 같은 운하 마을, 작은 베네치아를 발견했습니다' },
  { qid: 'Q576704', name: '안시 호수', aliases: ["Lac d'Annecy"], rarity: 'rare', cheer: '알프스의 에메랄드빛 호수를 마주했습니다' },
  { qid: 'Q206823', name: '랭스 대성당', aliases: ['Cathédrale Notre-Dame de Reims'], rarity: 'rare', cheer: '역대 프랑스 왕들이 대관식을 치른 성당에 닿았습니다' },
  { qid: 'Q476516', name: '루앙 대성당', aliases: ['Cathédrale Notre-Dame de Rouen'], rarity: 'rare', cheer: '모네가 그린 빛의 파사드를 마주했습니다' },
  { qid: 'Q687057', name: '베르동 협곡', aliases: ['Gorges du Verdon'], rarity: 'rare', cheer: '에메랄드빛 강물이 새겨낸 유럽의 그랜드캐니언을 발견했습니다' },
  { qid: 'Q501726', name: '필라 사구', aliases: ['Dune du Pilat'], rarity: 'rare', cheer: '유럽 최대의 모래언덕, 그 능선에 올랐습니다' },
];
