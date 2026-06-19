import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

interface Props {
  uri: string;
  caption?: string;
  aspectRatio?: number; // 이미지 영역 비율 (메이슨리 높이 변주)
  rotation?: number; // 살짝 기울여 핀보드 손맛
}

/** 폴라로이드 카드: 따뜻한 흰 프레임 + 아래 캡션 영역(추후 좋아요/댓글 자리). */
export default function Polaroid({
  uri,
  caption,
  aspectRatio = 1,
  rotation = 0,
}: Props) {
  return (
    <View style={[styles.frame, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <Image source={{ uri }} style={[styles.img, { aspectRatio }]} />
      <Text style={styles.caption} numberOfLines={1}>
        {caption && caption.length > 0 ? caption : ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.paper,
    borderRadius: 6,
    padding: 6,
    paddingBottom: 26,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  img: { width: '100%', borderRadius: 3, backgroundColor: COLORS.fogLight },
  caption: {
    color: COLORS.paperInk,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
