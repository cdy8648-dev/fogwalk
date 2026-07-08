import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { FONT } from '../../constants/fonts';
import { landmarkDisplayName, landmarkXp, rarityColor } from '../../constants/landmarks';
import { useDiscoveryPopupStore } from '../../store/discoveryPopupStore';
import ConfettiField from './ConfettiField';

/**
 * 02 발견 순간 — 등급색 라이트 버스트 + 확장 링 + 콘페티 풀스크린 연출.
 * 탭 또는 2.5초 후 자동으로 03 발견 카드로 전환.
 */

const AUTO_ADVANCE_MS = 2500;

function rarityTag(rarity?: string): string {
  if (rarity === 'legendary') return '★ LEGENDARY';
  if (rarity === 'epic') return '◆ EPIC';
  return '✦ RARE';
}

/** 확장 링 1개 — scale 0.25→2.6 / opacity 0.85→0, 2.4s 반복 (delay로 스태거). */
function BurstRing({ color, delay }: { color: string; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [v, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0] }),
          transform: [
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 2.6] }) },
          ],
        },
      ]}
    />
  );
}

export default function DiscoveryMomentOverlay() {
  const { width, height } = useWindowDimensions();
  const hero = useDiscoveryPopupStore((s) => s.hero);
  const advance = useDiscoveryPopupStore((s) => s.advance);

  const corePulse = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(corePulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    const timer = setTimeout(advance, AUTO_ADVANCE_MS);
    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [fadeIn, corePulse, advance]);

  if (!hero) return null;
  const accent = rarityColor(hero.rarity);
  const xp = landmarkXp(hero);
  const sightM = CONFIG.LANDMARK_BURST_RADIUS_K * 130; // gridDisk(k) ≈ k×130m

  return (
    <Animated.View style={[styles.wrap, { opacity: fadeIn }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={advance}>
        {/* 버스트 스테이지 (화면 42% 지점) */}
        <View style={[styles.stage, { top: height * 0.42, left: width / 2 }]}>
          <View style={[styles.glowOuter, { backgroundColor: accent }]} />
          <View style={[styles.glowInner, { backgroundColor: accent }]} />
          <BurstRing color={accent} delay={0} />
          <BurstRing color={accent} delay={800} />
          <BurstRing color={COLORS.lime} delay={1600} />
          <Animated.Text
            style={[
              styles.core,
              {
                transform: [
                  { translateX: -17 },
                  { translateY: -24 },
                  {
                    scale: corePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }),
                  },
                ],
              },
            ]}
          >
            ✦
          </Animated.Text>
        </View>

        {/* 콘페티 (버스트 위, 타이틀 아래) */}
        <ConfettiField count={30} />

        {/* 타이틀 블록 */}
        <View style={styles.titleBlock}>
          <Text style={[styles.tag, { color: accent }]}>{rarityTag(hero.rarity)}</Text>
          <Text style={styles.title}>랜드마크 발견</Text>
          <Text style={[styles.name, { color: accent }]}>{landmarkDisplayName(hero)}</Text>
          <View style={styles.chips}>
            <View style={[styles.chip, { borderColor: accent }]}>
              <Text style={[styles.chipText, { color: accent }]}>👁 시야 +{sightM}m 확보</Text>
            </View>
            {xp > 0 ? (
              <View style={[styles.chip, styles.chipLime]}>
                <Text style={[styles.chipText, { color: COLORS.lime }]}>+{xp} XP</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.hint}>탭하여 카드 열기</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,8,14,0.94)',
    zIndex: 1200,
    elevation: 1200,
  },
  stage: { position: 'absolute', width: 0, height: 0 },
  glowOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    marginLeft: -160,
    marginTop: -160,
    opacity: 0.14,
  },
  glowInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    marginLeft: -80,
    marginTop: -80,
    opacity: 0.28,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    marginLeft: -70,
    marginTop: -70,
    borderRadius: 70,
    borderWidth: 2,
  },
  core: {
    position: 'absolute',
    fontSize: 40,
    color: '#FBEBD2',
    textShadowColor: COLORS.gold,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  titleBlock: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 120,
    alignItems: 'center',
  },
  tag: { fontFamily: FONT.monoMedium, fontSize: 12, letterSpacing: 6 },
  title: {
    fontFamily: FONT.serif,
    fontSize: 34,
    color: '#F7F2E8',
    marginTop: 12,
    textShadowColor: 'rgba(224,164,88,0.5)',
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 4 },
  },
  name: { fontFamily: FONT.serif, fontSize: 20, marginTop: 6, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 10, marginTop: 20 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(224,164,88,0.10)',
  },
  chipLime: {
    borderColor: 'rgba(200,245,96,0.5)',
    backgroundColor: 'rgba(200,245,96,0.12)',
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    textAlign: 'center',
    fontFamily: FONT.mono,
    fontSize: 11,
    color: '#6B7187',
    letterSpacing: 1.5,
  },
});
