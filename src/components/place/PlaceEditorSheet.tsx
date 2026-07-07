import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { FONT } from '../../constants/fonts';
import { pickPlacePhoto, type PlaceDraft } from '../../services/places';
import type { Place } from '../../types';

const EMOJIS = ['🚩', '🏠', '❤️', '⭐', '🍜', '☕', '🌳', '🏞️', '🎣', '⛺', '🏋️', '🐶', '📚', '🎨', '🛒', '🎵'];

interface Props {
  visible: boolean;
  /** 수정 모드면 기존 장소 (생성 모드면 null). */
  editing: Place | null;
  /** 생성 비용 표기용. 수정은 무료. */
  ink: number;
  onSave: (draft: PlaceDraft) => void;
  onClose: () => void;
}

/**
 * 나만의 장소 생성/수정 시트 — 이모지·이름(필수)·메모·사진(카메라/앨범).
 * 주소는 저장 시 서비스가 역지오코딩으로 채운다(폼에서 입력받지 않음).
 */
export default function PlaceEditorSheet({ visible, editing, ink, onSave, onClose }: Props) {
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  // undefined=기존 유지, null=제거, string=새 임시 URI
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);

  // 열릴 때마다 초기화 (수정이면 기존 값 채움)
  useEffect(() => {
    if (!visible) return;
    setEmoji(editing?.emoji ?? EMOJIS[0]);
    setName(editing?.name ?? '');
    setMemo(editing?.memo ?? '');
    setPhoto(undefined);
  }, [visible, editing]);

  const creating = editing == null;
  const cost = CONFIG.INK_COST_PLACE;
  const canAfford = !creating || ink >= cost;
  const canSave = name.trim().length > 0 && canAfford;
  // 미리보기: 새로 고른 사진 > 기존 사진(유지 상태) > 없음
  const previewUri = photo !== undefined ? photo : editing?.photoUri ?? null;

  const pick = async (source: 'camera' | 'library') => {
    const uri = await pickPlacePhoto(source);
    if (uri) setPhoto(uri);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
            <Text style={styles.title}>{creating ? '🚩 나만의 장소' : '장소 수정'}</Text>
            {creating && (
              <Text style={styles.subtitle}>밝힌 땅에 잉크로 나만의 라벨을 남겨요</Text>
            )}

            {/* 이모지 선택 */}
            <View style={styles.emojiGrid}>
              {EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiCell, emoji === e && styles.emojiCellOn]}
                  onPress={() => setEmoji(e)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder={`장소 이름 (필수, ${CONFIG.PLACE_NAME_MAX}자)`}
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
              maxLength={CONFIG.PLACE_NAME_MAX}
            />
            <TextInput
              style={[styles.input, styles.memoInput]}
              placeholder="간단한 메모 (선택)"
              placeholderTextColor={COLORS.muted}
              value={memo}
              onChangeText={setMemo}
              maxLength={CONFIG.PLACE_MEMO_MAX}
              multiline
            />

            {/* 사진 */}
            <View style={styles.photoRow}>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.photoPreview} />
              ) : (
                <View style={[styles.photoPreview, styles.photoEmpty]}>
                  <Text style={styles.photoEmptyText}>사진</Text>
                </View>
              )}
              <View style={styles.photoBtns}>
                <TouchableOpacity style={styles.photoBtn} onPress={() => void pick('camera')}>
                  <Text style={styles.photoBtnText}>📷 카메라</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={() => void pick('library')}>
                  <Text style={styles.photoBtnText}>🖼️ 앨범</Text>
                </TouchableOpacity>
                {previewUri && (
                  <TouchableOpacity style={styles.photoBtn} onPress={() => setPhoto(null)}>
                    <Text style={styles.photoBtnText}>✕ 제거</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {editing?.address ? (
              <Text style={styles.address} numberOfLines={1}>
                📍 {editing.address}
              </Text>
            ) : creating ? (
              <Text style={styles.address}>📍 주소는 저장할 때 자동으로 채워져요</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.save, !canSave && styles.saveDisabled]}
              disabled={!canSave}
              activeOpacity={0.85}
              onPress={() => onSave({ emoji, name, memo, photoUri: photo })}
            >
              <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                {creating
                  ? canAfford
                    ? `만들기 (잉크 ${cost})`
                    : `잉크 부족 · ${cost} 필요 (보유 ${ink})`
                  : '저장'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(7,8,14,0.7)' },
  sheet: {
    backgroundColor: '#11131F',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: '#232844',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '86%',
  },
  title: { fontFamily: FONT.serif, fontSize: 20, color: '#F4EFE6' },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  emojiCell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.fogLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellOn: { borderColor: COLORS.violet, backgroundColor: 'rgba(139,124,255,0.15)' },
  emojiText: { fontSize: 20 },
  input: {
    backgroundColor: COLORS.fogLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    marginTop: 12,
  },
  memoInput: { minHeight: 64, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  photoPreview: { width: 64, height: 64, borderRadius: 12 },
  photoEmpty: {
    backgroundColor: COLORS.fogLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyText: { color: COLORS.muted, fontSize: 11 },
  photoBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  photoBtn: {
    backgroundColor: COLORS.fogLight,
    borderWidth: 1,
    borderColor: '#2E3450',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  photoBtnText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  address: { color: COLORS.muted, fontSize: 11, marginTop: 12 },
  save: {
    backgroundColor: COLORS.lime,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  saveDisabled: { backgroundColor: COLORS.fogLight },
  saveText: { color: COLORS.fog, fontWeight: '800', fontSize: 14 },
  saveTextDisabled: { color: COLORS.muted },
  cancel: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
  cancelText: { color: COLORS.muted, fontSize: 13 },
});
