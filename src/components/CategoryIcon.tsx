import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { GLYPH_BG } from '../constants/categoryIcons';
import { MARKER_COIN, MARKER_GLYPH } from '../constants/markerSvgs';

/**
 * 발견 카테고리 아이콘 (assets/markers 3D 클레이 코인 세트).
 * - CategoryCoin: 카드·필터·상세용. 등급색 링은 에셋 규칙대로 코인 "바깥"에 앱이 씌운다.
 *   원본의 feDropShadow는 rn-svg 호환을 위해 생성 단계에서 제거 → RN shadow로 재현.
 * - CategoryGlyph: 지도 마커 축소/리스트 셀용. 네이비 배경원 + 등급색 링 + 글리프 70%.
 */

// 코인 실경계 ≈ 캔버스 200 중 지름 180 (드롭섀도 여백) → 링에 꽉 차게 확대
const COIN_SCALE = 200 / 180;

interface CoinProps {
  icon: string; // manifest id ('detail-palace' 등)
  size: number; // 링 포함 지름
  ringColor?: string; // 등급색 링 (없으면 링 없이 코인만)
  ringWidth?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CategoryCoin({
  icon,
  size,
  ringColor,
  ringWidth = 2.5,
  shadow = true,
  style,
}: CoinProps) {
  const xml = MARKER_COIN[icon];
  if (!xml) return <View style={[{ width: size, height: size }, style]} />;
  const svgSize = Math.round(size * COIN_SCALE);
  const offset = -Math.round((svgSize - size) / 2);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: GLYPH_BG, // 링과 코인 사이 미세 틈 메움 + iOS 그림자 형태
        },
        ringColor ? { borderWidth: ringWidth, borderColor: ringColor } : null,
        shadow && {
          shadowColor: '#000',
          shadowOpacity: 0.45,
          shadowRadius: size * 0.09,
          shadowOffset: { width: 0, height: size * 0.06 },
        },
        style,
      ]}
    >
      <SvgXml
        xml={xml}
        width={svgSize}
        height={svgSize}
        style={{ marginLeft: offset, marginTop: offset }}
      />
    </View>
  );
}

/** 배경 없는 순수 글리프 — 지도 마커용(그림만 올라감).
 *  아이보리 글리프가 밝은 지도에서 묻히지 않게 콘텐츠 알파 그림자(iOS)로 가독성 확보. */
export function CategoryGlyphFlat({
  icon,
  size,
  style,
}: {
  icon: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const xml = MARKER_GLYPH[icon];
  if (!xml) return <View style={[{ width: size, height: size }, style]} />;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          // 배경 없는 뷰의 iOS 그림자는 렌더된 픽셀 알파를 따라감 → 글리프 모양 그림자
          shadowColor: '#000',
          shadowOpacity: 0.55,
          shadowRadius: 2.5,
          shadowOffset: { width: 0, height: 1 },
        },
        style,
      ]}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}

interface GlyphProps {
  icon: string;
  size: number; // 배경원 지름
  ringColor: string; // 등급색 2px 링 (에셋 규칙상 필수)
  style?: StyleProp<ViewStyle>;
}

export function CategoryGlyph({ icon, size, ringColor, style }: GlyphProps) {
  const xml = MARKER_GLYPH[icon];
  const glyphSize = Math.round(size * 0.7); // README 권장: 원 지름의 ~70%
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: GLYPH_BG,
          borderWidth: 2,
          borderColor: ringColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {xml ? <SvgXml xml={xml} width={glyphSize} height={glyphSize} /> : null}
    </View>
  );
}
