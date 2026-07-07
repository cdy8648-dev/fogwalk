import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BADGE_SVG } from '../constants/badgeSvgs';

interface Props {
  icon: string; // BADGE_SVG 키 (assets/badges 파일명)
  size: number;
  locked?: boolean; // 미획득이면 흐리게
}

/**
 * 뱃지 아이콘 — 네임스페이스된 SVG 문자열을 SvgXml로 렌더(그라디언트 id 충돌 없음).
 * 미획득은 opacity로 실루엣 처리(핸드오프 이미지의 어두운 잠금 뱃지와 동일 무드).
 */
export default function BadgeIcon({ icon, size, locked }: Props) {
  const xml = BADGE_SVG[icon];
  if (!xml) return <View style={{ width: size, height: size }} />;
  return (
    <View style={{ width: size, height: size, opacity: locked ? 0.26 : 1 }}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
