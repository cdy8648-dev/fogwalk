import { Alert, Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';
import { removePlace } from '../../services/places';
import type { Place } from '../../types';
import { formatDate } from '../../utils/date';

interface Props {
  place: Place;
  onEdit: () => void;
  onMove: () => void; // 위치 이동 모드 진입
  onClose: () => void;
}

/** 장소 상세 카드 — 사진·이름·주소·메모 + [공유/수정/위치 이동/삭제]. */
export default function PlaceDetailCard({ place, onEdit, onMove, onClose }: Props) {
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
    Alert.alert('장소 삭제', `"${place.name}"을(를) 삭제할까요?\n(사용한 잉크는 돌아오지 않아요)`, [
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

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        {place.photoUri ? (
          <Image source={{ uri: place.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoEmpty]}>
            <Text style={styles.bigEmoji}>{place.emoji}</Text>
          </View>
        )}
        <View style={styles.headBody}>
          <Text style={styles.name} numberOfLines={1}>
            {place.emoji} {place.name}
          </Text>
          {place.address ? (
            <Text style={styles.address} numberOfLines={1}>
              📍 {place.address}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDate(place.createdAt)} 기록</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {place.memo ? <Text style={styles.memo}>{place.memo}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={onShare}>
          <Text style={styles.actionText}>↗ 공유</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onEdit}>
          <Text style={styles.actionText}>✏️ 수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onMove}>
          <Text style={styles.actionText}>📍 위치 이동</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onDelete}>
          <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#11131F',
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.45)', // 개인 라벨 = 네온퍼플 테두리
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 56, height: 56, borderRadius: 12 },
  photoEmpty: {
    backgroundColor: COLORS.fogLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigEmoji: { fontSize: 26 },
  headBody: { flex: 1, minWidth: 0 },
  name: { color: '#F4EFE6', fontSize: 15, fontWeight: '800' },
  address: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  date: { color: COLORS.muted, fontSize: 10, marginTop: 2, fontFamily: FONT.mono },
  close: { padding: 4, alignSelf: 'flex-start' },
  closeText: { color: COLORS.muted, fontSize: 15 },
  memo: { color: COLORS.text, fontSize: 12.5, lineHeight: 18, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  action: {
    flex: 1,
    backgroundColor: COLORS.fogLight,
    borderWidth: 1,
    borderColor: '#2E3450',
    borderRadius: 11,
    paddingVertical: 9,
    alignItems: 'center',
  },
  actionText: { color: COLORS.text, fontSize: 11.5, fontWeight: '700' },
  deleteText: { color: COLORS.hotpink },
});
