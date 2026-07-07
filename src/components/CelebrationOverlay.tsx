import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { useAchievementStore } from '../store/achievementStore';
import { useDiscoveryPopupStore } from '../store/discoveryPopupStore';

/** 뱃지 획득·레벨업 축하 토스트. 큐의 맨 앞을 잠깐 띄우고 자동 종료.
 *  발견 팝업(더 높은 레이어)이 떠 있는 동안은 대기 — 가려진 채 소진되는 것 방지. */
export default function CelebrationOverlay() {
  const item = useAchievementStore((s) => s.queue[0]);
  const dismiss = useAchievementStore((s) => s.dismiss);
  const popupActive = useDiscoveryPopupStore((s) => s.phase != null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!item || popupActive) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(dismiss, 2800);
    return () => clearTimeout(timer);
  }, [item, popupActive, anim, dismiss]);

  if (!item || popupActive) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.card,
          {
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.texts}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%', // 긴 축하 문구가 화면 폭을 넘지 않게
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lime,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  emoji: { fontSize: 30, marginRight: 12 },
  texts: { alignItems: 'flex-start', flexShrink: 1 },
  title: { color: COLORS.lime, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.text, fontSize: 13, marginTop: 2 },
});
