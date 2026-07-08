import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';
import { POPUP } from '../../constants/popup';
import { removePlace } from '../../services/places';
import type { Place } from '../../types';
import GlassPanel from '../ui/GlassPanel';

interface Props {
  place: Place;
  onEdit: () => void;
  onClose: () => void;
}

// 핸드오프 토큰
const CARD_W = 296;
const PINK = '#FF6BB5';
const INNER = '#0F1120';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/**
 * 나만의 장소 플로팅 카드 (핸드오프 시안 1b) — 마커 위에 뜨는 콜라주 카드.
 * 폴라로이드 썸네일 + 워시테이프 + 핫핑크 MY 뱃지 + 메모 + 편집/공유/삭제.
 * 마커를 화면 중앙에 둔 상태로 이 카드가 그 위에 뜨고, 꼬리가 마커를 가리킨다.
 */
export default function PlaceFloatingCard({ place, onEdit, onClose }: Props) {
  // 등장(scale .92→1, opacity 0→1) + floaty(상하 부유) 애니메이션
  const enter = useRef(new Animated.Value(0)).current;
  const floaty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floaty, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floaty, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enter, floaty]);

  const onShare = () => {
    const lines = [
      `${place.emoji} ${place.name}`,
      place.address ? `📍 ${place.address}` : null,
      place.memo || null,
      '',
      '— FogWalk에서 밝힌 나만의 장소',
    ].filter((l): l is string => l != null);
    void Share.share({ message: lines.join('\n') });
  };

  const onDelete = () => {
    Alert.alert('장소 삭제', `"${place.name}"을(를) 지울까요?\n(사용한 잉크는 돌아오지 않아요)`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removePlace(place);
          onClose();
        },
      },
    ]);
  };

  const translateY = floaty.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Animated.View
      style={[styles.stack, { opacity: enter, transform: [{ translateY }, { scale }] }]}
    >
      <GlassPanel radius={POPUP.md.radius} shadow style={styles.card}>
        {/* 닫기 */}
        <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={8} accessibilityLabel="닫기">
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* 헤더: 폴라로이드 + 텍스트 */}
        <View style={styles.header}>
          <View style={styles.polaroid}>
            {place.photoUri ? (
              <Image source={{ uri: place.photoUri }} style={styles.polaroidImg} />
            ) : (
              <View style={[styles.polaroidImg, styles.polaroidEmpty]}>
                <Text style={styles.polaroidEmoji}>{place.emoji}</Text>
              </View>
            )}
          </View>
          <View style={styles.headText}>
            <View style={styles.badgeRow}>
              <View style={styles.myBadge}>
                <Text style={styles.myBadgeText}>♥ MY</Text>
              </View>
              <Text style={styles.cat}>{place.emoji} 내 장소</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {formatDate(place.createdAt)}
              {place.address ? ` · ${place.address}` : ''}
            </Text>
          </View>
        </View>

        {/* 메모 (있을 때만) */}
        {place.memo ? (
          <View style={styles.memoBox}>
            <Text style={styles.memoText}>{place.memo}</Text>
          </View>
        ) : null}

        {/* 액션 */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.85}>
            <Text style={styles.editText}>✏️ 편집</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
            <Text style={styles.shareText}>↗ 공유</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={onDelete} activeOpacity={0.85} accessibilityLabel="삭제">
            <Text style={styles.delText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </GlassPanel>
      {/* 워시테이프 — 블러 클립 밖(카드 위 레이어) */}
      <View style={styles.tape} pointerEvents="none" />
      {/* 카드 꼬리 — 아래 마커를 가리킴 */}
      <View style={styles.cardTail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: { width: CARD_W, alignItems: 'center' }, // 그림자는 GlassPanel 내부 레이어가 담당
  card: { width: CARD_W, padding: 14 },
  tape: {
    position: 'absolute',
    top: -11,
    left: 24,
    width: 74,
    height: 22,
    backgroundColor: 'rgba(139,124,255,0.5)',
    transform: [{ rotate: '-5deg' }],
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#181C2E',
    borderWidth: 1,
    borderColor: '#2E3450',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeText: { color: '#5B617A', fontSize: 11, fontWeight: '700' },
  header: { flexDirection: 'row', gap: 12 },
  polaroid: {
    width: 82,
    height: 82,
    backgroundColor: '#F4EFE6',
    paddingTop: 5,
    paddingHorizontal: 5,
    paddingBottom: 9,
    borderRadius: 5,
    transform: [{ rotate: '2deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  polaroidImg: { flex: 1, borderRadius: 3, width: '100%' },
  polaroidEmpty: { backgroundColor: '#1C2135', alignItems: 'center', justifyContent: 'center' },
  polaroidEmoji: { fontSize: 24 },
  headText: { flex: 1, minWidth: 0, paddingTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  myBadge: {
    backgroundColor: 'rgba(255,107,181,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,181,0.4)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  myBadgeText: { color: PINK, fontSize: 10, fontWeight: '800' },
  cat: { fontSize: 11, fontWeight: '700', color: COLORS.teal },
  name: { fontFamily: FONT.serif, fontSize: 17, color: '#F4EFE6', marginTop: 6 },
  meta: {
    fontFamily: FONT.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: '#5B617A',
    marginTop: 5,
  },
  memoBox: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: INNER,
    borderWidth: 1,
    borderColor: '#1E2235',
    borderRadius: 12,
  },
  memoText: { fontSize: 13, lineHeight: 19.5, color: COLORS.text },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { color: '#0D0F1A', fontWeight: '800', fontSize: 13 },
  shareBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#181C2E',
    borderWidth: 1,
    borderColor: '#2E3450',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
  delBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#181C2E',
    borderWidth: 1,
    borderColor: '#2E3450',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delText: { fontSize: 13 },
  cardTail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(20,23,38,0.82)', // 글래스 틴트 근사(삼각형은 블러 불가)
  },
});
