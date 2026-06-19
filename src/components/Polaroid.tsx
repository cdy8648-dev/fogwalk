import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

interface Props {
  uri: string;
  caption?: string;
  aspectRatio?: number; // 이미지 영역 비율 (메이슨리 높이 변주)
  rotation?: number; // 살짝 기울여 핀보드 손맛
}

/** 폴라로이드 카드: 종이 프레임 + 워시테이프 + 아래 캡션. */
export default function Polaroid({
  uri,
  caption,
  aspectRatio = 1,
  rotation = 0,
}: Props) {
  return (
    <View style={[styles.frame, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <View style={styles.washi} />
      <Image source={{ uri }} style={[styles.img, { aspectRatio }]} />
      {caption ? (
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.paper,
    borderRadius: 6,
    padding: 9,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  washi: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 56,
    height: 16,
    backgroundColor: 'rgba(200,245,96,0.55)',
    transform: [{ rotate: '-4deg' }],
    zIndex: 2,
  },
  img: { width: '100%', borderRadius: 2, backgroundColor: COLORS.fogLight },
  caption: {
    color: COLORS.paperInk,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 9,
    paddingHorizontal: 2,
  },
});
